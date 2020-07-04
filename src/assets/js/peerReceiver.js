export default class PeerServiceReciever {
    remotePeerIds= new Array();// You need this to link with specific DOM element
    connections= new Array(); // This is where you manage multi-connections
    disconnectBackoff = 1;

    constructor(peerId) {
        this.peer = null; 
        this.peerId = peerId;
        this.conn = null;
        this.call = null;
    }

    initialize = () => {
        this.displayChatMessage("Initializing game server...");

        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(null, {
            debug: 2
        });

        this.peer.on('open', (id) => {
            console.log('ID: ' + id);
            console.log("Awaiting connection...");
                        
            var event = new CustomEvent('gameserver', { detail: { type: "connected", peerid: id } } );
            document.dispatchEvent(event);
        });
        this.peer.on('connection', (c) => {
            this.handleConnection(c);
        });
        this.peer.on('disconnected', () => {
            console.log('Connection lost. Please reconnect');
            
            var event = new CustomEvent('gameserver', { detail: { type: "disconnected", state: false } });
            document.dispatchEvent(event);

            // Workaround for peer.reconnect deleting previous id
            //this.peer._lastServerId = this.peerId;
            //this.peer.reconnect();
        });
        this.peer.on('close', () => {
            this.conn = null;
            console.log("Connection destroyed. Please refresh.");            
        });
        this.peer.on('error', (e) => {
            console.log(e);
            alert(e);               
        });   
    };

    // Handle connection - this is most important part
    handleConnection = (conn) =>{
        this.remotePeerIds.push(conn.peer); // Add remote peer to list

        conn.on('open', () => {            
            console.log("Connected with peer: "+ conn.connectionId);
            conn.on('data', (data) => {
                // You can do whatever you want with the data from this connection - this is also the main part
                this.dataHandler(conn,data);
            });
            conn.on('error', (err) =>{
                // handle error 
                //connectionError(conn);
                console.log(err);            
                this.displayChatMessage("Player disconnected...");
            });
            conn.on('close', () =>{
                // Handle connection closed
                //connectionClose(conn);
                this.conn = null;
                console.log("Connection destroyed. Please refresh.");  
            });
         
            this.connections.push(conn);
        });        
    };

    dataHandler = (conn, data) => {
        switch(data.type) {
            case "scene":
                this.updateScene(data);
                // the game server should always be up to date with the current scene
                // so don't rely on the host client being up and running
                var event = new CustomEvent('gameserver', { detail: data });
                document.dispatchEvent(event);
                break;
            case "private": //
                this.privateMessage(data);
                break;
            default: //chat               
                this.broadcastMessage(data);
                break;
        }
    }

    endScene = () => {
        var msg = {
            type: "sceneend",
            username: "system",
            message: "The storyteller has ended the scene.",
        }
        this.broadcastMessage(msg);

        setTimeout( () => {
            for(var i=0;i<this.connections.length;i++){
                this.connections[i].close();
            }            
            this.peer.destroy();

            var event = new CustomEvent('gameend');
            document.dispatchEvent(event);
        }, 1000);        
    }
    
    broadcastMessage = (message) => {
        for(var i=0;i<this.connections.length;i++){
            if (this.connections[i].open) {
                this.connections[i].send(message);
            }
        }
    }

    updateScene = (message) => {        
        this.broadcastMessage(message);
    }

    privateMessage = (message) => {
        for(var i=0;i<this.connections.length;i++) {            
            if(this.connections[i].peer==message.player.lastPeerId || this.connections[i].peer==message.senderId){
                this.connections[i].send(message);               
            }
        }
    }

    displayChatMessage = (data) => {
        var chatLog = document.getElementById("chat-log");
        var chatLogMessage = document.createElement("DIV");  
        chatLogMessage.innerHTML = `<strong>System:</strong> ${data}`;
        chatLog.appendChild(chatLogMessage);

        chatLog.scrollTop = chatLog.scrollHeight;
    }
}