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

    SendMessage = (msg) => {        
        try {     
            window.opener.postMessage({type: "fcsVTT", data: msg});
        } 
        catch(e) {
            this.commonSvc.Notify("Can't connect FCS VTT. Try refreshing your browser.");
        }
    }    
}