import CommonService from './commonService';

export default class FCSVTT {    
    commonSvc = new CommonService();
    port = null;
    constructor() {        
        window.browser = (function () {         
            return window.msBrowser ||
              window.browser ||
              window.chrome;
        })();
    }

    /* message types */
    MsgDiceRoll = (character, skillType, skill, modifier) => {
        return {
            type: "diceroll",
            character: character,
            skillType: skillType,
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
            window.opener.postMessage({type: "fcsVTT", data: msg});
        } 
        catch(e) {
            this.commonSvc.Notify("Can't connect FCS VTT. Try refreshing your browser.");
        }
    }    
}