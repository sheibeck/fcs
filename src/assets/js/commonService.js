import Noty from 'noty'
import 'noty/lib/noty.css';
import 'noty/lib/themes/metroui.css';
import shortid from 'shortid'
import * as Sentry from '@sentry/browser';

export default class CommonService {
  latestVersion = "1.5.2";

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

    this.Notify('Copied to clipboard', 'info');
  }

  Notify = (message, type, timeout, callback) => {
      Noty.closeAll();

      if (!type)
      {
        type = 'error';
      }

      if (!timeout) {
        if (type == 'error') {
          timeout = 2000;
        }
        else {
          timeout = 1000;
        }
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

  GenerateUUID = function() {
    return shortid.generate();
  }
  
  SortObject = (obj) => {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;``
    }, {});
  }

  Slugify = (text) => {
    if (text) {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    }
    else {
      return text;
    }
  }
  
  Search = (searchText) => {
    let pathname = location.pathname.toLowerCase();
    if (pathname.includes('charactersheet'))
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
      if (`${process.env.NODE_ENV}` !== "production")
      {
        let environmentLabel = "BETA";
        if (window.location.host == "localhost:8080")
        {
          environmentLabel = "LOCAL";
        }        
        $('ul.navbar-nav').append(`<span class="d-print-none ml-5 mt-1 text-center text-white h4">** ${environmentLabel} **</span>`);
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
    if (id && id.indexOf("|") > -1) {
      return id.split("|")[1];
    } else {
      return id;
    }
  }

  SetId = function(type, id) {
    //ids are in the format of TYPE|ID, this will return just the id portion    
    return `${type.toUpperCase()}|${id}`;
  }


  CheckVersion = () => {    
    var currentVersion = localStorage.getItem("fcsVersion");

    if (currentVersion === null || currentVersion !== this.latestVersion) {
      let msg = `<i class="fas fa-bullhorn"></i> Click to see what's new in <a target="_blank" href="https://github.com/sheibeck/fcs/releases/tag/v${this.latestVersion}">v${this.latestVersion}</a>`;
      let dismiss = `localStorage.setItem('fcsVersion', '${this.latestVersion}')`;
      this.ShowAlert(msg, "info", dismiss);
    } 
  }

  ShowAlert = function(msg, type, dismiss) {    
    type = type ?? "info";
    let alertMsg = `<div id="alertdiv" class="d-print-none alert alert-${type}">
                      <a class="close" onclick="eval(${dismiss})" style="cursor:pointer;" data-dismiss="alert">×</a><span>${msg}</span></div>`;
    $('#alert_placeholder').append(alertMsg);
  }

  GetShortText = function(text) {
    if (text)
    {
      let maxLength = 100;
      return text.length < maxLength ? text : text.substring(0,maxLength) + "...";
    }
    return text;
  }

  GetPlayerIdForDom = function(playerId) {
    return playerId.replace(":","-");
  }

  DeepCopy(objToCopy) {
    return JSON.parse( JSON.stringify( objToCopy ) );
  }

  GetFormattedDate(date) {
    var year = date.getFullYear();

    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;

    var time = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: false, minute: 'numeric' });

    let dateString =  year + '-' + month + '-' + day + 'T' + time;

    return dateString;
  }
}