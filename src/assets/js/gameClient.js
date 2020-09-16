import { DiceRoller } from 'rpg-dice-roller';
import CommonService from "./commonService";
import PeerService from "./peerService";

export default class GameClient {    
    commonSvc = new CommonService();
    peerSvc = new PeerService();
    players = new Array();    
    connections = new Array();    
    mediaConnections = new Array();
    myStream = null;
    maxReconnectRetries = 3;
    mediaSettings = { 
        useVideo: true, 
        useAudio: true, 
        videoDevice: null, 
        audioDevice: null,        
    };
    userName = null;

    constructor(gameId, playerId, isHost) {
        this.peer = null;         
        this.conn = null;
        this.gameId = gameId;
        this.lastPeerId = null;
        this.isHost = isHost;
        this.playerId = playerId;        
    }

    initialize = () => {
        this.displayChatMessage({ "userName": "System", "message": "Attempting to connect to scene..." });
        
        // Create own peer object with connection to shared PeerJS server
        this.peer = this.peerSvc.GetPeerConnection();

        console.log('ID: ' + this.peer.id);

        this.peer.on('open', (id) => {             
            this.handlePeerOpened(id);           
        });

        this.peer.on('connection', (c) => {
           
        });           

        this.peer.on('call', (call) => {                     
            call.answer(this.myStream); // Answer the call with an A/V stream.

             // Store a global reference of the stream 
            this.mediaConnections.push(call);        

            call.on('stream', (remoteStream) => {
                this.onReceiveStream(remoteStream, call.metadata);
            });
            
            call.peerConnection.oniceconnectionstatechange = (ev) => {
                if (call.peerConnection.iceConnectionState == "disconnected") {                    
                    this.cleanupConnections();
                }
            }  

            call.on('close', (remoteStream) => {
                //this.cleanupConnections();
            });

            call.on('error', (err) => {
                console.log(err.message);                
            })
        });

        this.peer.on('disconnected', () => {            
            console.log('Player connection lost.');        
            let event = new CustomEvent('userdisconnected', { detail: { type: "disconnected", player: { userName: "You"} } });
            document.dispatchEvent(event);
        });
        this.peer.on('close', () => {            
            this.conn = null;
            console.log('Connection destroyed. Please refresh');
        });        
        this.peer.on('error', (e) => {
            let event = new CustomEvent('clienterror', { detail: e });
            document.dispatchEvent(event);                     
        });        
    };

    /**
     * Create the connection between the two Peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    join = async (userName, mediaSettings) => {
        this.mediaSettings = mediaSettings;
        this.userName = userName;

        // Close old connection
        if (this.conn) {
            this.conn.close();
        }

        // Create connection to the game server
        this.conn = this.peer.connect(this.gameId, { metadata: { playerId: this.playerId, peerId: this.peer.id, userName: this.userName } });
        this.connections.push(this.conn);
       
        this.conn.on('open', async () => {        
            console.log("Connected to: " + this.conn.peer);
            await this.handleSelfJoinedGame(userName);
        });
    };

    async handleSelfJoinedGame(userName) {
        // Receive messages
        this.conn.on('data', (data) => {
            console.log('Received', data);

            switch(data.type) {
                case "scene":
                    this.drawScene(data);
                    break;
                case "players":
                    this.handlePlayersUpdate(data);
                    break;
                default: //chat                
                    this.displayChatMessage(data);
                    break;
            }
        });

        this.sendChatMessage("System", `${userName} connected!`);

        let event = new CustomEvent('userjoined');
        document.dispatchEvent(event);
        
        await this.startLocalMedia();
    } 

    async startLocalMedia() {
        const usbcamera = "4c3d1367c73f62297322c127b73008d56d60b714025d46ce3944f296498d7b7b"
        const usbmic = "27c67373401df8a0adaeb3cb3cbacb8629eac9569f4172d4002bd03d8aca29a2"
        const integratedcamera = "7fd5e26b38ce25a9afcda31d01fc21d9757e29c7f05b87159e56edcd2e971221";
        const integratedmic = "3cb36dccda7b356477126cd13e4e3178e0279bc1a5dab3bac19854282980ee86"

        let videoSettings = this.mediaSettings.useVideo;
        let audioSettings = this.mediaSettings.useAudio;

        //if we aren't showing audio or video then render the players
        if (!videoSettings && !audioSettings) {
            return;
        }        

        //find audio/video constraints. If we don't find any exact IDs then we set to true 
        // and it will use the system defaults
        const audioSource = this.mediaSettings.microphoneDevice == "default" ? null : this.mediaSettings.microphoneDevice;
        const videoSource = this.mediaSettings.videoDevice == "default" ? null : this.mediaSettings.videoDevice;
        const constraints = {
            audio: (!audioSource || !audioSettings) ? audioSettings : {deviceId: audioSource ? {exact: audioSource} : undefined},
            video: (!videoSource || !videoSettings) ? videoSettings : {deviceId: videoSource ? {exact: videoSource} : undefined}
        };

        let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;        
        await getUserMedia(constraints, 
            (stream) => {
                this.myStream = stream;                
                this.onReceiveStream(stream, this.playerId);

                //now that you are connected call any other players                
                this.players.forEach( (player) => {                      
                    //if not connect to a player and the player isn't me then start a media connection                    
                    if (player.peerId !== this.peer.id && !(player.peerId in this.mediaConnections)) {
                        this.handleRemoteMediaConnection(player);
                    }
                });
            },
            (err) => {
                this.commonSvc.Notify(err.message);
                console.error(err);
            }); 
      
    }

    onReceiveStream(stream, metadata) {   
        let player = null;     
        if (typeof(metadata) == "string") {
            //this is our own video stream
            player = { playerId: this.playerId, peerId: this.peer.id, userName: this.userName }
        }
        else {
            //find the information who we are being connected with
            player = metadata.caller;            
            if (player.playerId == this.playerId) {
                player = metadata.receiver;
            }
        }
       
        let videoElem = this.createMediaElements(player);           
       
        // Set the given stream as the video source 
        videoElem.srcObject = stream;
        
        videoElem.onloadedmetadata = (e) => {
            videoElem.play();
            //don't playback your own audio            
            if (videoElem.parentElement.id == this.commonSvc.GetPlayerIdForDom(this.playerId))
            {
                videoElem.muted = true;
            }
        };        
    }

    cleanupConnections() {
        for (let conn = 0; conn < this.mediaConnections.length; conn++) {
            let mediaStream = this.mediaConnections[conn];            
            if (!mediaStream.open || mediaStream.peerConnection.iceConnectionState === "disconnected") {
                //find the media stream that closed
                let player = mediaStream.metadata.caller;
                if (player.playerId == this.playerId) {
                    player = mediaStream.metadata.receiver;
                }
                const playerVidDomId = this.commonSvc.GetPlayerIdForDom(player.playerId);
                let playerContainer = document.getElementById(playerVidDomId);
                
                if (playerContainer) {
                    let vidElems = playerContainer.querySelectorAll('video'); 
                    if (vidElems.length > 0)
                    {
                        let vidElem = vidElems[0];                        
                        if (vidElem.dataset.peerid === player.peerId) {
                            playerContainer.parentNode.removeChild(playerContainer);
                        }
                    }
                    else {
                        //we don't have video
                        playerContainer.parentNode.removeChild(playerContainer);
                    }
                }
                mediaStream.close();
            }
        }

        //cleanup connections
        this.mediaConnections = this.mediaConnections.filter( conn => conn.open == true );        
        this.connections = this.connections.filter( conn => conn.open == true );
    }
        
    createMediaElements(player) {        
        const playerVidDomId = this.commonSvc.GetPlayerIdForDom(player.playerId);
        let playerContainer = document.getElementById(playerVidDomId);
        let vidElems = playerContainer.querySelectorAll('video');
        if (vidElems.length == 0) {
            let vidTemplate = `<video style="${this.mediaSettings.useVideo ? "-webkit-transform: scaleX(-1);transform: scaleX(-1);" : ""}" poster="${this.getPlaceholderImage(player.userName)}"></video>`;
            let imgPlaceHolder = playerContainer.getElementsByTagName("img");
            if (imgPlaceHolder.length > 0) {
                imgPlaceHolder = imgPlaceHolder[0];
                imgPlaceHolder.parentNode.removeChild(imgPlaceHolder);
            }
            playerContainer.insertAdjacentHTML('beforeend', vidTemplate);
        }        
        let videoElem = playerContainer.getElementsByTagName("video")[0];
        videoElem.dataset.peerid=player.peerId;
        return videoElem;
    }

    removeVideoElement(id) {
        let videoElem = videoContainer.getElementById(id);
        videoElem.parentNode.removeChild(videoElem);
    }

    handlePeerOpened(id) {        
        console.log('Player peer opened with ID: ' + this.peer.id);
        var event = new CustomEvent('userconnected', { detail: id });
        document.dispatchEvent(event);
    }

    handlePlayersUpdate(data) {
        if (!this.peer) return;
        this.players = data.message;
        
        //render player names so we know who is logged in        
        this.players.forEach( (player) => {                      
                        
            let id = this.commonSvc.GetPlayerIdForDom(player.playerId);
            let userName = player.userName;
            
            let playerContainer = document.getElementById("player-container");
            let playerElem = document.getElementById(id)
            if (playerElem == null) {
                var playerTemplate = `
                    <div id="${id}" class="mr-1">
                        <div class="userheader bg-light text-center d-flex">
                            <div class="mr-auto">${userName}</div>
                            <div class="media-controls small pt-1 text-right">
                                <i title="Mute microphone" class="fas fa-microphone ${this.mediaSettings.useAudio == "false" ? "d-none" : "" }" data-id="${id}" data-action="mute" onclick="this.nextElementSibling.classList.remove('d-none'); this.classList.add('d-none'); document.dispatchEvent(new CustomEvent('mediacontrol', { detail: {playerId: this.dataset.id, type: this.dataset.action} }));"></i>
                                <i title="Unmute microphone" class="fas fa-microphone-slash d-none" data-id="${id}" data-action="unmute" onclick="this.previousElementSibling.classList.remove('d-none'); this.classList.add('d-none');document.dispatchEvent(new CustomEvent('mediacontrol', { detail: {playerId: this.dataset.id, type: this.dataset.action} }));"></i>
                                <i title="Pause video" class="far fa-pause-circle ${this.mediaSettings.useVideo == "false" ? "d-none" : "" }" data-id="${id}" data-action="pause" onclick="this.nextElementSibling.classList.remove('d-none'); this.classList.add('d-none');document.dispatchEvent(new CustomEvent('mediacontrol', { detail: {playerId: this.dataset.id, type: this.dataset.action} }));"></i>
                                <i title="Play video" class="fas fa-play-circle d-none" data-id="${id}" data-action="play" onclick="this.previousElementSibling.classList.remove('d-none'); this.classList.add('d-none');document.dispatchEvent(new CustomEvent('mediacontrol', { detail: {playerId: this.dataset.id, type: this.dataset.action} }));"></i>
                            </div>                            
                        </div>
                        <img src="${this.getPlaceholderImage(player.userName)}" />
                    </div>`;
                playerContainer.insertAdjacentHTML('beforeend', playerTemplate);
            }     
        });        
    };

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    getPlaceholderImage(text) {
        return `https://ipsumimage.appspot.com/130x100,${this.getRandomColor()}?l=${text}`;
    }

    handleRemoteMediaConnection = (player) => {
        //connect to other players, but don't connect to yourself )
        if (player.peerId === this.peer.id) return;
        
        let call = this.peer.call(player.peerId, this.myStream, { metadata: 
            { 
                caller: { playerId: this.playerId, peerId: this.peer.id, userName: this.userName },
                receiver: player
            } 
        });
        this.mediaConnections.push(call);
        call.on('stream', (remoteStream) => {            
            this.onReceiveStream(remoteStream, call.metadata);
        });

        call.peerConnection.oniceconnectionstatechange = (ev) => {           
            if (call.peerConnection.iceConnectionState == "disconnected") {                
                this.cleanupConnections();
            }
        }  
    }
 
    sendChatMessage = (userName, message) => {        
        message = this.parseDiceRolls(message);
        
        var msg = {
            type: "chat",
            userName: userName,
            message: message,
        }

        this.conn.send(msg);
    }

    sendPrivateMessage = (userName, player, message) => {        
        var msg = {
            type: "private",
            player: player,            
            userName: userName,
            message: message,
        }

        this.conn.send(msg);
    }

    parseDiceRolls(message) {        
        const diceRegx = /\/roll (\d*)(D[\df]*)((?:[+*-](?:\d+|\([A-Z]*\)))*)(?:\+(D\d*))?/i;
        let roll = message.match(diceRegx);
        if (roll)
        {
            const roller = new DiceRoller();
            const rollEquation = `${roll[1]}${roll[2] == "df" ? "dF.2" : roll[2]}${roll[3] ? roll[3]:''}`;

            roller.roll(rollEquation);

            // get the latest dice rolls from the log
            var latestRoll = roller.log.shift();
            var displayDice = '';
            var diceType = roll[2] == "df" ? "fate" : roll[2];
            
            //if we're rolling fate dice
            
            latestRoll.rolls[0].rolls.forEach(roll => {
                if (diceType == "fate") {
                    switch (roll.value) {
                        case -1:                        
                            //displayDice += '<span class="dice">-</span>';
                            displayDice += '[-]';
                            break;
                        case 1:
                            //displayDice += '<span class="dice">+</span>';
                            displayDice += '[+]';
                            break;
                        default:
                            //displayDice += '<span class="dice">0</span>';
                            displayDice += '[0]';
                            break;
                    }
                }
                else {
                    displayDice += `[${roll.value}]`
                }
            });
            //return message += `<p class='dice-roll current-roll'>${displayDice} ${(roll[3] !== '' ? ' (' + roll[3] + ')' : '')} = ${latestRoll.total}</p>`;
            return message += `> **${displayDice} ${(roll[3] !== '' ? ' (' + roll[3] + ')' : '')} = ${latestRoll.total}**`;
        }
        else {  
            return message;
        }
    }
    
    updateScene = (scene) => {        
        var msg = {
            type: "scene",
            message: scene     
        }
        this.conn.send(msg);
    } 

    drawScene = (data) => {        
        var event = new CustomEvent('sceneupdate', { detail: { scene: data.message } });
        document.dispatchEvent(event);
    }

    displayChatMessage = (data) => {        
        let pm = "";
        
        if (data.player) {
            if (data.player.playerId == this.playerId) {
                pm = `(pm ${data.player.userName})`;
            } else {
                pm = `(pm)`;
            }
        }

        var event = new CustomEvent('displaychatmessage', { detail: { userName: `${data.userName}${pm}`, message: data.message } });
        document.dispatchEvent(event);
    }
}