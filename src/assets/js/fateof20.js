export default class FateOf20 {
    // for local dev
    devExtensionId = "pdackompknmfmhalbdbdoncafoeebbhp";    
    extensionId = "fmejbimehejoebbhmgimpjpjdfeplpia";
    
    port = null;

    constructor() {        
        this.CheckForExtension();
    }

    CheckForExtension = () => {
        // try to connect to the live app       
        chrome.runtime.sendMessage(this.extensionId, { message: "installed?" }, null, response => {                      
            if (!response) {
                //try local
                chrome.runtime.sendMessage(this.devExtensionId, { message: "installed?" }, null, response => {
                    if (!response) {                        
                        fcs.$store.state.roll20Installed = false;
                        return;
                    }                    
                    this.ConnectToExtension(this.devExtensionId);
                  });            
            }
            else {                
                this.ConnectToExtension(this.extensionId);
            }
          });
    }

    ConnectToExtension(id) {
        fcs.$store.state.roll20Installed = true;
        this.port = chrome.runtime.connect(id);
        this.port.onMessage.addListener(this.HandleListener);
    }

    /* message types */
    MsgDiceRoll = (character, skill, modifier) => {
        return {
            type: "diceroll",
            character: character,
            skill: skill,
            modifier: modifier           
        }
    }

    MsgInvoke = (character, description, aspect) => {
        return {
            type: "invoke",
            character: character,
            description: description,
            aspect: aspect,
        }
    }

    MsgFatePoint = (character, description, modifier) => {
        return {
            type: "fatepoint",
            character: character,
            description: description,
            modifier: modifier,                          
        }
    }

    MsgStress = (character, description, stress) => {
        return {
            type: "stress",
            character: character,
            description: description,
            stress: stress,
        }
    }

    MsgConsequence = (character, description, consequence) => {
        return {
            type: "consequence",
            character: character,
            description: description,
            consequence: consequence,            
        }
    }

    SendMessage = (msg) => {         
        this.port.postMessage(msg);
    }

    HandleListener = (msg) => {
        console.log(msg.result);
    }

    HandleError = (response) => {
        console.error(response);
    }            
}