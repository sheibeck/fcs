export default class PeerServiceReciever {
    remotePeerIds= new Array();// You need this to link with specific DOM element
    connections= new Array(); // This is where you manage multi-connections

    constructor(peerId) {
        this.peer = null; 
        this.peerId = peerId;
        this.conn = null;
        this.call = null;
    }

    initialize = () => {
        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(this.peerId, {            
            debug: 2
        });

        this.peer.on('open', (id) => {             
            console.log('ID: ' + id);
            console.log("Awaiting connection...");
            
            var event = new CustomEvent('gameserver', { detail: true });
            document.dispatchEvent(event);
        });
        this.peer.on('connection', (c) => {
            this.handleConnection(c);            
        });
        this.peer.on('disconnected', () => {            
            console.log('Connection lost. Please reconnect');
            
            var event = new CustomEvent('gameserver', { detail: false });
            document.dispatchEvent(event);

            // Workaround for peer.reconnect deleting previous id
            //this.peer._lastServerId = this.peerId;
            //this.peer.reconnect();
        });
        this.peer.on('close', () => {
            this.conn = null;
            console.log("Connection destroyed. Please refresh.");            
        });
        this.peer.on('error', (err) => {
            console.log(err);            
            alert('' + err);
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
            conn.on('error', () =>{
                // handle error 
                //connectionError(conn);
                console.log(err);            
                alert('' + err);                
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
            default: //chat                
                /*var chatLog = document.getElementById("chat-log");
                var chatLogMessage = document.createElement("DIV");  
                chatLogMessage.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
                chatLog.appendChild(chatLogMessage);
                */
               
                this.broadcastMessage(data);
            break;
        }
    }

    // So now you have multi-connections. If you want to send a message to all other peer, just using for loop with all the connections
    broadcastMessage = (message) => {
        for(var i=0;i<this.connections.length;i++){
            this.connections[i].send(message);
        }
    }

    // Or if you want to send a message to a specific peer - you need to know his peerid
    privateMessage = (remotePeerId,message) => {
        for(var i=0;i<this.connections.length;i++) {
            if(this.connections[i].peer==remotePeerId){
                this.connections[i].send(message);
                break;
            }
        }
    }
}