import { DiceRoller } from 'rpg-dice-roller';

export default class FCSVTTClient {    
    constructor() {
        window.addEventListener("message", this.handleListener, false);
        this.diceRoller = new DiceRoller();
    }

    handleListener = (msg) => {        
        if (msg.data.type !== "fcsVTT") return;
        msg = msg.data.data;                   
        
        let chatMessage = "";
        let subMessage = "";
        switch(msg.type) {         
            case "diceroll":                                 
                chatMessage = {
                    character: msg.character,
                    action: `Rolled: <em>${msg.skill}</em>`,
                    roll: { 
                        modifier: `${msg.modifier||0}`,                       
                    }
                };                
                console.log(chatMessage);
                break;
            case "invoke":                
                chatMessage = {
                    character: msg.character, 
                    action: "Invoked an aspect", 
                    description: msg.aspect
                };     
                break;
            case "fatepoint":               
                subMessage = parseInt(msg.modifier) > 0 ? "Gained a Fate Point": "Spent a Fate Point";                
                chatMessage = {
                    character: msg.character, 
                    action: subMessage                    
                };  
                break;
            case "stuntextra":
                let stuntextra = msg.stuntextra.match(/(.*?):(.*)/);
                chatMessage = {
                    character: msg.character, 
                    action: `Stunt/Gear: <em>${stuntextra[1]}</em>`, 
                    description: stuntextra[2]
                };                  
                break;
            case "stress":               
                subMessage = `${msg.stress ? "Took" : "Recovered"} ${msg.description} stress`;                
                chatMessage = {
                    character: msg.character, 
                    action: subMessage,                     
                };  
                break;
            case "consequence":            
                if (msg.consequence !== "")
                {                    
                    chatMessage = {
                        character: msg.character, 
                        action: `Gained ${msg.description}`,
                        description: msg.consequence,
                    };  
                    
                }
                else {                    
                    chatMessage = {
                        character: msg.character, 
                        action: `Recovered ${msg.description}`,
                        description: msg.consequence,
                    };  
                }
                break;
        }
        this.chatMessage(chatMessage);
    }

    chatMessage = (message) => {  
        let description = message.description||"";      

        if (message.roll) {
            this.diceRoller.roll(`4dF.2+${message.roll.modifier}`);
            // get the latest dice rolls from the log
            var latestRoll = this.diceRoller.log.shift();
            var displayDice = '';

            $.each(latestRoll.rolls[0].rolls, function (key, value) {
                switch (value.value) {
                    case -1:
                        displayDice += '<span class="dice">-</span>';
                        break;
                    case 1:
                        displayDice += '<span class="dice">+</span>';
                        break;
                    default:
                        displayDice += '<span class="dice">0</span>';
                        break;
                }
            });

            displayDice += ` ${message.roll.modifier.indexOf('-') == -1 ? "+" : ""} ${message.roll.modifier} = ${latestRoll.total}`;
            description = displayDice;
        }

        let chatCard = `<div class="card border-dark my-1 mx-1 py-0">
            <div class="card-header py-0 font-weight-bold">${message.character}</div>
            <div class="card-body text-dark py-0">                
                <p class="card-text py-0 mb-1">${message.action}</p>
                <p class="card-text py-0 font-weight-bold">${description}</p>
            </div>
        </div>`;

        window.parent.postMessage({type: "charactersheet", data: chatCard});        
    }
}