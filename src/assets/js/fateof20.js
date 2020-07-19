import CommonService from './commonService';

export default class FateOf20 {  
    //for manual installation of extension
    devExtensionId = "";    
    extensionId = "fmejbimehejoebbhmgimpjpjdfeplpia";
    commonSvc = new CommonService();
    
    port = null;

    constructor() {        
        window.browser = (function () {         
            return window.msBrowser ||
              window.browser ||
              window.chrome;
        })();   

        this.CheckForExtension();
    }

    GetExtensionId() {       
        let options = localStorage.getItem('fatecharactersheet_dev_extension_id');
        return options;
    }

    CheckForRoll20IsRunning = () => {        
        this.port.postMessage({ message: "roll20Running?" });            
    }

    CheckForExtension = () => {               
        try {        
            // try to connect to the live app       
            browser.runtime.sendMessage(this.extensionId, { message: "installed?" }, null, response => {                      
                if (!response) {
                    //see if the user manually installed
                    this.devExtensionId = this.GetExtensionId();
                    if (this.devExtensionId) {
                        browser.runtime.sendMessage(this.devExtensionId, { message: "installed?" }, null, response => {
                            if (!response) {                        
                                fcs.$store.state.roll20Installed = false;
                                return;
                            }                    
                            this.ConnectToExtension(this.devExtensionId);
                        });
                    }
                }
                else {                
                    this.ConnectToExtension(this.extensionId);
                }
            });
        } catch(e) {
            return;
        }
    }

    ConnectToExtension = async (id) => {         
        this.port = browser.runtime.connect(id);
        this.port.onMessage.addListener(this.HandleListener);

        this.CheckForRoll20IsRunning();
        fcs.$store.state.roll20Installed = true;
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
        if (msg.result.roll20Connect) { 
            debugger;           
            fcs.$store.state.roll20Running = msg.result.roll20Connect;
        }
        console.log(msg.result);
    }

    HandleError = (response) => {
        console.error(response);
    }            
}