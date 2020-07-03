ROLL20_URL = "*://app.roll20.net/editor/";
var roll20IsRunning = false;

window.browser = (function () {
    return window.msBrowser ||
      window.browser ||
      window.chrome;
  })();

function sendMessageTo(url, request) {
    browser.tabs.query({ url }, (tabs) => {        
        for (let tab of tabs) {            
            browser.tabs.sendMessage(tab.id, request);
        }
    })
}

browser.runtime.onMessageExternal.addListener(function(request, sender, respond) {     
    switch(request.message) {
       case "installed?":
            respond(true);
            break;           
    }    
});

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
    if (request.message == "roll20IsRunning") {
        roll20IsRunning = true;
    }

    sendResponse();
});

// For simple requests:
// For simple requests:
browser.runtime.onConnectExternal.addListener(function(port) {
    port.onMessage.addListener(function(msg) {        
        if (msg.message == "roll20Running?") {
            port.postMessage({result: { roll20Connect: roll20IsRunning}});
        }
        else {

            switch(msg.type) { 
                case "diceroll":               
                    port.postMessage({result: `${msg.character} used ${msg.skill}: /roll 4df+(${msg.modifier})`});
                    break;
                case "invoke":      
                    port.postMessage({result: `${msg.character} invoked ${msg.description}: ${msg.aspect}`});
                    break;
                case "stuntextra":            
                    port.postMessage({result: `${msg.character} used ${msg.stuntextra}`});
                    break;
                case "fatepoint":
                    port.postMessage({result: `${msg.character} ${msg.modifier == 1 ? "gained" : "spent"} a Fate Point`});
                    break;
                case "stress":
                    port.postMessage({result: `${msg.character} ${msg.stress ? "took" : "recovered"} ${msg.description} stress`});
                    break;
                case "consequence":
                    if (msg.consequence === "")
                    {
                        port.postMessage({result: `${msg.character} recovered a ${msg.description} consequence`});
                    }
                    else {
                        port.postMessage({result: `${msg.character} gained a ${msg.description} consequence ${msg.consequence}`});
                    }
                    break
                default:
                    port.postMessage({result: `Unrecognized message type`});
            }            
        }

        sendMessageTo(ROLL20_URL, msg)
      });
    }); 