export default class FateOf20 {
    // for local dev
    //editorExtensionId = "pdackompknmfmhalbdbdoncafoeebbhp";    
    editorExtensionId = "fmejbimehejoebbhmgimpjpjdfeplpia";
    
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