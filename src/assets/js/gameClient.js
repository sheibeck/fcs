import { DiceRoller } from 'rpg-dice-roller';
import CommonService from "./commonService";

export default class GameClient {
    getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    commonSvc = new CommonService();
    players = new Array();    
    connections = new Array();    
    mediaStreams = new Array();

    constructor(gameId) {
        this.peer = null; 
        this.peerId = null;
        this.conn = null;
        this.gameId = gameId;  
        this.lastPeerId = null;
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

        this.join();
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
        this.conn = this.peer.connect(this.gameId);
        this.connections.push(this.conn);
       
        this.conn.on('open', () => {        
            console.log("Connected to: " + this.conn.peer);
            this.handleSelfJoinedGame(username);
        });
    };

    handleSelfJoinedGame(username) {        
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

        this.startLocalMedia();
    } 

    startLocalMedia() {
        //connect my own media
        this.getUserMedia({ audio: true, video: true }, 
            (stream) => {                    
                this.onReceiveStream(stream, 'my-camera');
            },
            (err) => {
                alert("Cannot get access to your camera and video !");
                console.error(err);
            });
    }

    onReceiveStream(stream, element_id) {
        // Retrieve the video element according to the desired
        let video = document.getElementById(element_id);
        // Set the given stream as the video source 
        video.srcObject = stream;

        video.onloadedmetadata = function(e) {
            video.play();
          };
    
        // Store a global reference of the stream
        this.mediaStreams.push(stream);
    }

    handlePeerOpened(id) {        
        console.log('Player peer opened with ID: ' + this.peer.id);
        var event = new CustomEvent('userconnected', { detail: id });
        document.dispatchEvent(event);

        this.peer.on('call', (call) => {
            this.getUserMedia({video: true, audio: true}, function(stream) {
                call.answer(stream); // Answer the call with an A/V stream.
                call.on('stream', (remoteStream) => {
                    this.onReceiveStream(stream, 'peer-camera');
                });
            }, (err) => {
                console.log('Failed to get local stream' ,err);
            });
        });
    }

    handlePlayersUpdate(data) {
        if (!this.peer) return;

        this.players = data.message;

        this.players.forEach( (player) => {            
            //if not connect to a player and the player isn't me then start a media connection
            if (!(player in this.peer.connections) && player !== this.peer.id) {
                this.handleMediaConnection(player);
            }
        });

    };

    handleMediaConnection = (player) => {        
        this.getUserMedia({video: true, audio: true}, (stream) => {
            let call = this.peer.call(player, stream);            
            call.on('stream', (remoteStream) => {
                this.onReceiveStream(remoteStream, player);
            });
        }, (err) => {
            console.log('Failed to get local stream' ,err);
        });
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
    
    updateScene = (scene, connectionId) => {        
        var msg = {
            type: "scene",
            message: scene,
            connectionId: connectionId,
        }
        this.conn.send(msg);
    } 

    drawScene = (data) => {        
        var event = new CustomEvent('sceneupdate', { detail: { scene: data.message, connectionId: data.connectionId } });
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