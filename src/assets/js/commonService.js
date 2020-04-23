export default class CommonService {
  constructor(fcs){
    this.fcs = fcs;
  }

  GetShareUrl = (elem) => {
      var baseUrl = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
      var shareUrl = baseUrl + elem.prev().attr('href');

      var tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = shareUrl;
      console.log(shareUrl);

      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      this.Notify('Copied url to clipboard', 'info', 2000);
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

    commonSvc.Notify('Copied thing to clipboard', 'info', 2000);
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

  IsEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }

  RemoveEmptyObjects = (obj) => {
    $.each(obj, function(key, value){
        if (key === "")
        {
          delete obj[""];
        }
        else {
          if (value === "" || value === null || value === undefined || value === {}){
              delete obj[key];
          } else if (Object.prototype.toString.call(value) === '[object Object]') {
              this.removeEmptyObjects(value);
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

  GenerateUUID() { // Public Domain/MIT
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

  EmptyGuid() {
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
    if (pathname.includes('charactersheets') || pathname.includes('character'))
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
    else if (pathname.includes('adversary'))
    {
          this.fcs.$children[0].$children[0].list(searchText); //adversary search
      }
      else if (pathname.includes("campaign")) {
          if (pathname.endsWith("campaign")) {
              this.fcs.$options.filters.filterCampaigns();
          } else {
              this.fcs.$options.filters.filterSessions();
          }
      }
  }
  
  // help out with dev tasks by switching environments up based on the URL
  SetupForEnvironment = function () {
      if (this.fcs.$store.state.environment !== 'production')
      {
        $('body').prepend('<h1 class="d-print-none">'+ this.fcs.$store.state.environment.toUpperCase() +'</h1>');
      }

      if (window.location.host !== 'localhost:8080' && window.location.host.indexOf("gitpod.io") == -1)
      {
        Sentry.init({
          dsn: 'https://2efc80c955be4b38b84e67b30d23610a@sentry.io/5174522',
          environment: this.fcs.$store.state.environment,
        });
      }
  }

  GetNiceDate(date) {
    return new Date(date).toLocaleString();
  }
}