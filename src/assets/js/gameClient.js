import { DiceRoller } from 'rpg-dice-roller';
import CommonService from "./commonService";

export default class GameClient {
    getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    commonSvc = new CommonService();
    players = new Array();    
    connections = new Array();    
    mediaConnections = new Array();
    myStream = null;

    constructor(gameId, playerId, userName, isHost) {
        this.peer = null;         
        this.conn = null;
        this.gameId = gameId;
        this.lastPeerId = null;
        this.isHost = isHost;
        this.playerId = playerId;
        this.userName = userName;
    }

    initialize = () => {
        this.displayChatMessage({ "username": "System", "message": "Attempting to connect to scene..." });
        
        let peerId = this.commonSvc.GeneratePeerId();

        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(peerId, {
            debug: 3,
            secure: true,
            host: "fcs-peer-server.herokuapp.com",
            port: 443
        });

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
                this.onReceiveStream(remoteStream, call.peer);
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
           console.log('Connection lost. Please reconnect');

           let event = new CustomEvent('userdisconnected');
           document.dispatchEvent(event);        
        });
        this.peer.on('close', () => {            
            this.conn = null;
            console.log('Connection destroyed. Please refresh');
        });        
        this.peer.on('error', (e) => {
            console.log(e);
            alert('Game may not be running. ' + e);           
        });        
    };

    /**
     * Create the connection between the two Peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    join = async (username) => {
        // Close old connection
        if (this.conn) {
            this.conn.close();
        }

        // Create connection to destination peer specified in the input field
        this.conn = this.peer.connect(this.gameId, { metadata: { playerId: this.playerId, peerId: this.peer.id, userName: username } });
        this.connections.push(this.conn);
       
        this.conn.on('open', async () => {        
            console.log("Connected to: " + this.conn.peer);
            await this.handleSelfJoinedGame(username);
        });
    };

    async handleSelfJoinedGame(username) {
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

        this.sendChatMessage(username, "connected!");

        let event = new CustomEvent('userjoined');
        document.dispatchEvent(event);
        
        await this.startLocalMedia();
    } 

    async startLocalMedia() {        
        const usbcamera = "4c3d1367c73f62297322c127b73008d56d60b714025d46ce3944f296498d7b7b"
        const usbmic = "27c67373401df8a0adaeb3cb3cbacb8629eac9569f4172d4002bd03d8aca29a2"
        const integratedcamera = "7fd5e26b38ce25a9afcda31d01fc21d9757e29c7f05b87159e56edcd2e971221";
        const integratedmic = "3cb36dccda7b356477126cd13e4e3178e0279bc1a5dab3bac19854282980ee86"

        let videoSettings = true;
        let audioSettings = true;

        const debugging = true;
        if (`${process.env.NODE_ENV}` === "development" && debugging)
        {          
          if (window.location.host == "localhost:8080")
          {
            videoSettings = {
                deviceId: { exact: this.isHost ?  integratedcamera : usbcamera }
            } 
            audioSettings = false;
          }                  
        }

        await this.getUserMedia({ 
                audio: audioSettings,
                video: videoSettings,
            }, 
            (stream) => {                                 
                this.myStream = stream;                
                this.onReceiveStream(stream, 'my-camera');

                //now that you are connected call any other players                
                this.players.forEach( (player) => {            
                    //if not connect to a player and the player isn't me then start a media connection                    
                    if (!(player.peer in this.peer.connections) && player !== this.peer.id) {
                        this.handleRemoteMediaConnection(player);
                    }
                });
            },
            (err) => {
                this.commonSvc.Notify(err.message);
                console.error(err);
            }); 
      
    }

    gotDevices(mediaDevices) {
        select.innerHTML = '';
        select.appendChild(document.createElement('option'));
        let count = 1;
        mediaDevices.forEach(mediaDevice => {
          if (mediaDevice.kind === 'videoinput') {
            const option = document.createElement('option');
            option.value = mediaDevice.deviceId;
            const label = mediaDevice.label || `Camera ${count++}`;
            const textNode = document.createTextNode(label);
            option.appendChild(textNode);
            select.appendChild(option);
          }
        });
    }

    
    onReceiveStream(stream, id) {
        let videoElem = this.createVideoElement(id);
        
        // Set the given stream as the video source 
        videoElem.srcObject = stream;
        
        videoElem.onloadedmetadata = function(e) {
            videoElem.play();
        };
    }

    cleanupConnections() {        
        for (let conn = 0; conn < this.mediaConnections.length; conn++) {
            let mediaStream = this.mediaConnections[conn];            
            if (!mediaStream.open || mediaStream.peerConnection.iceConnectionState === "disconnected") {
                let vidElem = document.getElementById(mediaStream.peer);
                if (vidElem)
                    vidElem.parentNode.removeChild(vidElem);
                mediaStream.close();
            }
            this.mediaConnections = this.mediaConnections.filter( conn => conn.open == true );
        }

        //cleanup chat connections
        this.connections = this.connections.filter( conn => conn.open == true );        
    }

    createVideoElement(id) {
        let videoContainer = document.getElementById("video-container");
        let videoElem = document.getElementById(id);
        if (videoElem == null) {            
            var newElem = document.createElement('video');
            newElem.id = id;
            videoContainer.appendChild(newElem);
            videoElem = document.getElementById(id);            
        }
        if (videoElem.id == "my-camera") {                                
            videoElem.muted = true;
        }        
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
    };

    handleRemoteMediaConnection = (player) => {
        //connet to other players, but don't connect to yourself )
        if (player.peerId === this.peer.id) return;
        
        let call = this.peer.call(player.peerId, this.myStream, { metadata: { playerId: this.playerId, peerId: this.peer.id, userName: this.userName } });
        this.mediaConnections.push(call);
        call.on('stream', (remoteStream) => {
            this.onReceiveStream(remoteStream, call.peer);
        });

        call.peerConnection.oniceconnectionstatechange = (ev) => {           
            if (call.peerConnection.iceConnectionState == "disconnected") {                
                this.cleanupConnections();
            }
        }  
    }
 
    sendChatMessage = (username, message) => {
        message = this.parseDiceRolls(message);

        var msg = {
            type: "chat",
            username: username,
            message: message,
        }

        this.conn.send(msg);
    }

    sendPrivateMessage = (username, player, message) => {
        var msg = {
            type: "private",
            player: player,
            senderId: this.peer.id,
            username: username,
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
                            displayDice += '<span class="dice">-</span>';
                            break;
                        case 1:
                            displayDice += '<span class="dice">+</span>';
                            break;
                        default:
                            displayDice += '<span class="dice">0</span>';
                            break;
                    }
                }
                else {
                    displayDice += `<span>[${roll.value}]</span>`
                }
            });
            return message += `<p class='dice-roll current-roll'>${displayDice} ${(roll[3] !== '' ? ' (' + roll[3] + ')' : '')} = ${latestRoll.total}</p>`;
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
            if (data.senderId == this.peer.id) {
                pm = `(pm ${data.player.username})`;
            } else {
                pm = `(pm)`;
            }
        }

        var chatLog = document.getElementById("chat-log");
        var chatLogMessage = document.createElement("DIV");  
        chatLogMessage.innerHTML = `<strong>${data.username}${pm}:</strong> ${data.message}`;
        chatLog.appendChild(chatLogMessage);

        chatLog.scrollTop = chatLog.scrollHeight;
        
    }
}