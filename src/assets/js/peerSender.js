import { DiceRoller } from 'rpg-dice-roller';

export default class PeerServiceReciever {
    constructor(gameId) {
        this.peer = null; 
        this.peerId = null;
        this.conn = null;
        this.gameId = gameId;  
        this.lastPeerId = null;         
    }

    initialize = () => {
        this.displayChatMessage({ "username": "System", "message": "Attempting to connect to scene..." });

        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', (id) => {            
            console.log('ID: ' + this.peer.id);

            var event = new CustomEvent('userconnected', { detail: id });
            document.dispatchEvent(event);
        });
        this.peer.on('connection', (c) => {
            // Disallow incoming connections
            c.on('open', () => {
                c.send("Sender does not accept incoming connections");
                setTimeout(function() { c.close(); }, 500);
            });
        });
        this.peer.on('disconnected', () => {            
            console.log('Connection lost. Please reconnect');

            var event = new CustomEvent('userdisconnected');
            document.dispatchEvent(event);

            // Workaround for peer.reconnect deleting previous id            
            //this.peer._lastServerId = this.lastPeerId;
            //this.peer.reconnect();            
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
       
        this.conn.on('open', () => {            
            console.log("Connected to: " + this.conn.peer);

            // Receive messages
            this.conn.on('data', (data) => {
                console.log('Received', data);

                switch(data.type) {
                    case "scene":
                        this.drawScene(data);
                        break;
                    default: //chat                
                        this.displayChatMessage(data);
                        break;
                }
            });

            // Check URL params for comamnds that should be sent immediately
            /*
            var command = getUrlParam("command");
            if (command)
                conn.send(command);
            */
            this.sendChatMessage(username, "connected!");

            var event = new CustomEvent('userjoined');
            document.dispatchEvent(event);
        });
    };
 
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