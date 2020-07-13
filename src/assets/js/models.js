import CommonService from "./commonService"

export default class Models {    
    commonSvc = new CommonService();

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

    SceneAspect = (name, label, type, hasInvoke) => {         
        var aspect = {id: this.commonSvc.GenerateUUID(), invokes: [], name: name || "Aspect Name", label: label || "", object_type: type };
        if (hasInvoke) {
            aspect.invokes.push(this.SceneInvoke());
        }
        return aspect;
    }

    SceneStress = (name, type)  => {
        return {id: this.commonSvc.GenerateUUID(), boxes: [], name: name || "Stress", object_type: type }; 
    }
    
    SceneStressBox = (label) => {
        return {id: this.commonSvc.GenerateUUID(), used: false, label: label};
    }

    SceneSkill = (name, value, type) => {
        return {id: this.commonSvc.GenerateUUID(), name: name || "Skill Name", value: value || "+0", object_type: type }
    }

    SceneConsequence = (name, label, value, type)  => {                
        return {id: this.commonSvc.GenerateUUID(), invokes: [], name: name || "Consequence", label: label || "1", value: value, object_type: type }
    }

    SceneCondition = (name, type)  => {        
        return {id: this.commonSvc.GenerateUUID(), boxes: [], name: name || "Condition", object_type: type };
    }

    SceneInvoke = () => {
        return {id:this.commonSvc.GenerateUUID(), used: false}
    }

    SceneStuntExtra = (name, value, type) => {
        return {id: this.commonSvc.GenerateUUID(), name: name || "Stunt/Extra", value: value || "Stunt/extra effect", object_type: type };
    }

    SceneNPC = () => {
        return  {
            "stress": [],
            "object_type": "NPC",            
            "aspects": [],           
            "type": "NPC",
            "stunts": {},
            "skills": [],            
            "name": "NPC",
            "genre": "Any",
            "consequences": [],
            "id": this.commonSvc.GenerateUUID(),
            "originalId": ""            
        }
    }
}