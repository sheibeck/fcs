export default class CommonService {
  constructor(fcs){
    this.fcs = fcs;
  }

  CopyTextToClipboard = (text) => {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = text;
    console.log(text);

    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    this.Notify('Copied to clipboard', 'info', 2000);
  }

  Notify = (message, type, timeout, callback) => {
      Noty.closeAll();

      if (!type)
      {
        type = 'error';
      }

      if (!timeout) {
        timeout = false;
      }

      new Noty({
          theme: 'metroui',
          type: type,
          timeout: timeout,
          text: message,
          callbacks: {
            onClose: callback || null,
          }
      }).show();
  }

  IsEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }

  RemoveEmptyObjects = (obj) => {
    $.each(obj, (key, value) => {
        if (key === "")
        {
          delete obj[""];
        }
        else {
          if (value === "" || value === null || value === undefined || value === {}){
              delete obj[key];
          } else if (Object.prototype.toString.call(value) === '[object Object]') {
              this.RemoveEmptyObjects(value);
          } else if ($.isArray(value)) {
              $.each(value, function (k,v) {
                if (v === "") {
                  value.splice(k);
                }
              });
          }
        }
      });
  };

  GenerateUUID = function() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  EmptyGuid = function() {
    return "00000000-0000-0000-0000-000000000000";
  }

  SortObject = (obj) => {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;``
    }, {});
  }

  Slugify = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }
  
  Search = (searchText) => {
    let pathname = location.pathname.toLowerCase();
    if (pathname.includes('charactersheets'))
    {
      $('.card').hide();

      // filter by character name and description
      $(".card-title:contains('" + searchText + "'), .card-note:contains('" + searchText + "'), .card-text:contains('" + searchText + "')", ".card")
        .parent().show();

      //account for body text in a card
      $(".card-title:contains('" + searchText + "'), .card-note:contains('" + searchText + "'), .card-text:contains('" + searchText + "')", ".card-body")
        .parent().parent().show();

      // filter by footer content
      $(".card-footer:contains('" + searchText + "')")
        .parent().show();
    }  
    else if (pathname.includes("campaign")) {
        if (pathname.endsWith("campaign")) {
            this.fcs.$options.filters.filterCampaigns();
        } else {
            this.fcs.$options.filters.filterSessions();
        }
    }
    else
    {
      //search with dynamodb
      this.fcs.$children[0].$children[0].list(searchText); 
    }
  }
  
  // help out with dev tasks by switching environments up based on the URL
  SetupForEnvironment = () => {
      if (this.fcs.$store.state.environment !== 'production')
      {
        let environmentLabel = "BETA";
        if (window.location.host == 'localhost:8080')
        {
          environmentLabel = "LOCAL";
        }        
        $('body').prepend(`<h1 class="d-print-none">${environmentLabel}</h1>`);
      }

      if (window.location.host !== 'localhost:8080' && window.location.host.indexOf("gitpod.io") == -1)
      {
        Sentry.init({
          dsn: 'https://2efc80c955be4b38b84e67b30d23610a@sentry.io/5174522',
          environment: this.fcs.$store.state.environment,
        });
      }
  }

  GetNiceDate = function(date) {
    return new Date(date).toLocaleString();
  }

  GetId = function(id) {
    //ids are in the format of TYPE|ID, this will return just the id portion
    if (id) {
      return id.split("|")[1];
    } else {
      return id;
    }
  }

  SetId = function(type, id) {
    //ids are in the format of TYPE|ID, this will return just the id portion    
    return `${type.toUpperCase()}|${id}`;
  }

  GetRootOwner = function() {
    return 'JARVIS';
  }
}