ROLL20_URL = "*://app.roll20.net/editor/";

function sendMessageTo(url, request) {
    chrome.tabs.query({ url }, (tabs) => {        
        for (let tab of tabs) {            
            chrome.tabs.sendMessage(tab.id, request);
        }
    })
}

// For simple requests:
// For simple requests:
chrome.runtime.onConnectExternal.addListener(function(port) {
    port.onMessage.addListener(function(msg) {        
        switch(msg.type) { 
            case "diceroll":                      
                port.postMessage({result: `${msg.character} used ${msg.skill}: /roll 4df+${msg.modifier}`});                
                break;
            case "invoke":      
                port.postMessage({result: `${msg.character} invoked ${msg.description}: ${msg.aspect}`});
                break;
            default:
                port.postMessage({result: `Unrecognized message type`});
        }

        sendMessageTo(ROLL20_URL, msg)
      });
    }); 