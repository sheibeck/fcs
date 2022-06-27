import { Peer } from 'peerjs';

export default class PeerService {    
    constructor(){        
    }

    GetPeerConnection = (peerId) => {
        if (!peerId) {
            peerId = this.GeneratePeerId();
        }
        return new Peer(peerId, {
            debug: 1,
            secure: true,
            host: "fcs-peer-server.herokuapp.com",
            port: 443           
        });
    }
    
    GeneratePeerId = function() {  
        return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
    }
}