export default class FateOf20 {
    // The ID of the extension we want to talk to.
    editorExtensionId = "imabdeabahdahhekhhciinbagdcdpibo";
    port = null;

    constructor() {
        // Start a long-running conversation:
        this.port = chrome.runtime.connect(this.editorExtensionId);
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