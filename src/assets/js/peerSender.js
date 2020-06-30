export default class PeerServiceReciever {

    constructor(gameId) {
        this.peer = null; 
        this.peerId = null;
        this.conn = null;
        this.gameId = gameId;  
        this.lastPeerId = null;         
    }

    initialize = () => {        
        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', (id) => {            
           console.log('ID: ' + this.peer.id);
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

            // Workaround for peer.reconnect deleting previous id            
            this.peer._lastServerId = this.lastPeerId;

            this.peer.reconnect();
        });
        this.peer.on('close', () => {
            this.conn = null;
            console.log('Connection destroyed. Please refresh');
        });
        this.peer.on('error', (err) => {
            console.log(err);
            alert('Game may not be running. ' + err);
        });

        this.join();
    };

    /**
     * Create the connection between the two Peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    join = (username) => {
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
        });
    };
 
    sendChatMessage = (username, message) => {
        var msg = {
            type: "chat",
            username: username,
            message: message,
        }
        this.conn.send(msg);
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
        data.message.lastUpdatedBy = data.connectionId;
        var event = new CustomEvent('sceneupdate', { detail: { scene: data.message, connectionId: data.connectionId } });
        document.dispatchEvent(event);
    }

    displayChatMessage = (data) => {
        var chatLog = document.getElementById("chat-log");
        var chatLogMessage = document.createElement("DIV");  
        chatLogMessage.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
        chatLog.appendChild(chatLogMessage);

        chatLog.scrollTop = chatLog.scrollHeight;
    }
}