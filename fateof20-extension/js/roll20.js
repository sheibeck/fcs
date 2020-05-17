console.log("loaded roll20.js");

function handleListener(msg, sender, sendResponse) {    
    let chatMessage = "";
    switch(msg.type) { 
        case "diceroll":    
            let thing = msg.skill.split(" ");            
            let template = "&{template:default} {{name=" + msg.character + "}} {{" + thing[0] + "=" + thing[1] + "}} {{roll (4df+" + msg.modifier + ")=[[4df+(" + msg.modifier + "||0)]]}}";            
            chatMessage = template;
            break;
        case "invoke":      
            chatMessage = "&{template:default} {{name=" + msg.character + "}} {{action=Invoked an aspect}} {{aspect=" + msg.aspect +"}}";
            break;
        case "fatepoint":               
            const m = parseInt(msg.modifier) > 0 ? "Gained a Fate Point": "Spent a Fate Point";
            chatMessage = "&{template:default} {{name=" + msg.character + "}} {{action=" + m +"}}"; 
            break;
    }
    roll20ChatMessage(chatMessage, msg.character);
}

const chat = document.getElementById("textchat-input");
const txt = chat.getElementsByTagName("textarea")[0];
const btn = chat.getElementsByTagName("button")[0];


//from beyond20 extension
function roll20ChatMessage(message, character = null) {
    let set_speakingas = true;
    const old_as = speakingas.value;
    if (character) {
        character = character.toLowerCase();
        for (let i = 0; i < (speakingas.children.length); i++) {
            if (speakingas.children[i].text.toLowerCase() === character) {
                speakingas.children[i].selected = true;
                set_speakingas = false;
                break;
            }
        }
    }
    if (set_speakingas)
        speakingas.children[0].selected = true;
    const old_text = txt.value;
    txt.value = message;
    btn.click();
    txt.value = old_text;
    speakingas.value = old_as;
}

chrome.runtime.onMessage.addListener(handleListener);
