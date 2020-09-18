console.log("loaded roll20.client.js");

window.browser = (function () {
    return window.msBrowser ||
      window.browser ||
      window.chrome;
  })();

function handleListener(msg, sender, sendResponse) {    
    let chatMessage = "";
    let subMessage = "";   
    switch(msg.type) {         
        case "diceroll":                                 
            let template = "&{template:default} {{name=" + msg.character + "}} {{" + msg.skillType + "=" + msg.skill + "}} {{roll [4df+(" + msg.modifier + ")]=[[4df+(" + (parseInt(msg.modifier)||0) + ")]]}}";            
            chatMessage = template;
            console.log(template);
            break;
        case "invoke":      
            chatMessage = "&{template:default} {{name=" + msg.character + "}} {{action=Invoked an aspect}} {{aspect=" + msg.aspect +"}}";
            break;
        case "fatepoint":               
            subMessage = parseInt(msg.modifier) > 0 ? "Gained a Fate Point": "Spent a Fate Point";
            chatMessage = "&{template:default} {{name=" + msg.character + "}} {{action=" + subMessage +"}}";
            break;
        case "stuntextra":
            let stuntextra = msg.stuntextra.match(/(.*?):(.*)/);
            chatMessage = "&{template:default} {{name=" + msg.character + "}} {{action=" + stuntextra[1] + "}} {{Desc=" + stuntextra[2] +"}}";            
            break;
        case "stress":               
            subMessage = `${msg.stress ? "Took" : "Recovered"} ${msg.description} stress`;
            chatMessage = "&{template:default} {{name=" + msg.character + "}} {{action=" + subMessage +"}}"; 
            break;
        case "consequence":            
            if (msg.consequence !== "")
            {                
                chatMessage = "&{template:default} {{name=" + msg.character + "}} {{gained=" + msg.description + " consequence}} {{consequence=" + msg.consequence + "}}"; 
            }
            else {
                chatMessage = "&{template:default} {{name=" + msg.character + "}} {{recovered=" + msg.description + " consequence}}"; 
            }
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

browser.runtime.onMessage.addListener(handleListener);

browser.extension.sendMessage({ message: "roll20IsRunning" }, function(response) {
    //code to initialize my extension
    console.log("fate of 20 extension initialized.")
});
