import CommonService from "./commonService";

export default class GameServer {    
    remotePeers= new Array();// You need this to link with specific DOM element
    connections= new Array(); // This is where you manage multi-connections
    commonSvc = new CommonService();
    maxReconnectRetries = 3;

    constructor(peerId) {
        this.peer = null; 
        this.peerId = peerId;
        this.conn = null;
        this.call = null;
    }

    initialize = () => {
        this.displayChatMessage("Initializing game server...");

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
            console.log('Game server opened with ID: ' + this.peer.id);
            console.log("Awaiting player connections...");
                        
            var event = new CustomEvent('gameserver', { detail: { type: "connected", peerid: id } } );
            document.dispatchEvent(event);
        });
        this.peer.on('connection', (c) => {
            this.handleConnection(c);
        });
        this.peer.on('disconnected', () => {
            console.log('Server disconnected.');
            var event = new CustomEvent('gameserver', { detail: { type: "disconnected", state: false } });
            document.dispatchEvent(event);            
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
        this.remotePeers.push(conn.metadata); // keep a list of connected

        conn.on('open', () => {            
            console.log("Connected with peer: "+ conn.connectionId);
          
            conn.on('data', (data) => {
                // You can do whatever you want with the data from this connection - this is also the main part
                this.dataHandler(conn,data);
            });
            conn.on('error', (err) =>{                
                console.log(err);            
                this.displayChatMessage("A player failed to connect...");
            });
            conn.on('close', () =>{   
                this.handlePlayerDisconnect(conn);
            });
         
            this.connections.push(conn);
            //send the player data            
            this.sendPlayerData();
        });        
    };

    handlePlayerDisconnect(conn) {
        console.log(`Peer ${conn.peer} disconnected.`);        
        this.remotePeers = this.remotePeers.filter( rc => rc.peerId !== conn.peer );
        this.connections = this.connections.filter( rc => rc.connectionId !== conn.connectionId );   
                                 
        var event = new CustomEvent('userdisconnected', { detail: { type: "disconnected", player: conn.metadata } });
        document.dispatchEvent(event);

        //update the players with peer connections
        this.sendPlayerData();
    }  

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
            case "players":
                this.sendPlayerData();
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
    
    sendPlayerData() {
        var msg = {
            type: "players",
            username: "system",
            message: JSON.parse( JSON.stringify( this.remotePeers ) ),
        }
        this.broadcastMessage(msg);
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