export default class PeerServiceReciever {

    constructor(peerId) {
        this.peer = null; 
        this.peerId = peerId;
        this.conn = null;
    }

    initialize = () => {
        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(this.peerId, {            
            debug: 2
        });

        this.peer.on('open', (id) => {             
            console.log('ID: ' + id);
            console.log("Awaiting connection...");
        });
        this.peer.on('connection', (c) => {
            // Allow only a single connection
            if (this.conn && this.conn.open) {
                c.on('open', () => {
                    c.send("Already connected to another client");
                    setTimeout(function() { c.close(); }, 500);
                });
                return;
            }

            this.conn = c;
            console.log("Connected to: " + this.conn.peer);
            this.ready();
        });
        this.peer.on('disconnected', () => {            
            console.log('Connection lost. Please reconnect');
            
            // Workaround for peer.reconnect deleting previous id
            this.peer.id = this.peerId;
            this.peer._lastServerId = this.peerId;

            this.peer.reconnect();
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

    /**
     * Triggered once a connection has been achieved.
     * Defines callbacks to handle incoming data and connection events.
     */
    ready = () => {
        this.conn.on('data', (data) => {
            console.log("Data recieved");
            switch(data.type) {
                default: //chat
                debugger;
                    var chatLog = document.getElementById("chat-log");
                    var chatLogMessage = document.createElement("DIV");  
                    chatLogMessage.innerHTML = data.message;   
                    chatLog.appendChild(chatLogMessage);
                break;
            }
        });
        this.conn.on('close', () => {
            console.log("Connection reset. Awaiting connection...");
            this.conn = null;
        });
    }

}