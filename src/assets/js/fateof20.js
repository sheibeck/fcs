import CommonService from './commonService';

export default class FateOf20 {
    // for local dev
    devExtensionId = "ihebifhjieemlbahfbaalkblgnmkfbem";    
    extensionId = "fmejbimehejoebbhmgimpjpjdfeplpia";
    commonSvc = new CommonService();

    port = null;

    constructor() {        
        this.CheckForExtension();
    }

    GetExtensionId() {       
        let options = localStorage.getItem('fatecharactersheet_dev_extension_id');
        return options;
    }

    CheckForExtension = () => {
        this.devExtensionId = this.GetExtensionId();

        // try to connect to the live app       
        browser.runtime.sendMessage(this.extensionId, { message: "installed?" }, null, response => {                      
            if (!response) {
                //try local
                browser.runtime.sendMessage(this.devExtensionId, { message: "installed?" }, null, response => {
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
        this.port = browser.runtime.connect(id);
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

    MsgStuntExtra = (character, stuntextra) => {
        return {
            type: "stuntextra",
            character: character,            
            stuntextra: stuntextra,
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
        try {     
            this.port.postMessage(msg);
        } 
        catch(e) {
            this.commonSvc.Notify("Can't connect to Fate of 20 extension. Try refreshing your browser.");
        }
    }

    HandleListener = (msg) => {
        console.log(msg.result);
    }

    HandleError = (response) => {
        console.error(response);
    }            
}