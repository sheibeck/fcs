import Noty from 'noty';
import 'noty/lib/noty.css';
import 'noty/lib/themes/metroui.css';
import shortid from 'shortid';
import * as Sentry from '@sentry/browser';
import {version} from '../../../package.json';

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
          } else if (Array.isArray(value)) {
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
        return result;
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
    const currentVersion = localStorage.getItem("fcsVersion");
    const packageVersion = version;

    if (currentVersion === null || currentVersion !== packageVersion) {
      let msg = `<i class="fas fa-bullhorn"></i> Click to see what's new in <a target="_blank" href="https://github.com/sheibeck/fcs/releases/tag/${packageVersion}">v${packageVersion}</a>`;
      let dismiss = `localStorage.setItem('fcsVersion', '${packageVersion}')`;
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
  
  bringToFrontOfSiblings(id) {
    let objElem = document.getElementById(id);
    if (objElem.style.zIndex !== 10) {
      objElem.style.zIndex = 10;

      // Setup siblings array and get the first sibling
      var siblings = [];
      var sibling = objElem.parentNode.firstChild;

      // Loop through each sibling and push to the array
      while (sibling) {
        if (sibling.nodeType === 1 && sibling !== objElem) {
          sibling.style.zIndex = 0;
        }
        sibling = sibling.nextSibling
      }
    }
  }

  parseSearchData(data) {    
    var searchData = [];
    this.addSearchKey("name", data.name, searchData);
    if (data.aspects) {
      let highconcept = data.aspects.highconcept;
      if (!highconcept) highconcept = data.aspects.high_concept;
      if (!highconcept && Object.keys(data.aspects).length > 0) highconcept =  data.aspects[Object.keys(data.aspects).sort()[0]];
      this.addSearchKey("highconcept", highconcept, searchData);

      let trouble = data.aspects.trouble;            
      if (!trouble && Object.keys(data.aspects).length > 1) trouble =  data.aspects[Object.keys(data.aspects).sort()[1]];
      this.addSearchKey("trouble", trouble, searchData);

      this.addSearchKey("aspects", data.aspects.other_aspects, searchData);
    }
    this.addSearchKey("object_type", data.object_type, searchData);
    this.addSearchKey("system", data.system, searchData);
    this.addSearchKey("genre", data.genre, searchData);
    this.addSearchKey("related_id", data.related_id, searchData);
    this.addSearchKey("type", data.type, searchData);

    if (data.tags) {
      let tags = data.tags.map(function(elem){
        return elem.text.toLowerCase();
      }).join(",");
      this.addSearchKey("tags", tags, searchData);
    }

    return searchData.join("||");
  }
  addSearchKey(key, value, searchData) {
    if (value) {
      searchData.push(`${key}=${value.toLowerCase()}`);
    }
  }

  getVal(obj, graphPath, defaultValue){   
    var parts = graphPath.split(".");
    var root = obj;

    for (var i = 0; i < parts.length; i++)
    {
      var part = parts[i];
      //account for false values in checkboxes
      if ((root[part] || root[part] == false) && root.hasOwnProperty(part))
        root = root[part];
      else
        return (defaultValue || "");
    }

    return eval(`obj.${graphPath}`);
  }

  setVal(obj, arr, val, Vue) {      
    arr = arr.split(".");
    
    if (arr.length == 1)
    {
      Vue.set(obj, arr[0], val);       
    }
    if (arr.length == 2)
    {        
      if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
      Vue.set(obj[arr[0]], arr[1], val);  
    }
    if (arr.length == 3)
    {
      if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
      if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]], arr[1], {});
      Vue.set(obj[arr[0]][arr[1]], arr[2], val);             
    }
    if (arr.length == 4)
    {
      if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
      if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]], arr[1], {});
      if (!obj[arr[0]][arr[1]][arr[2]]) Vue.set(obj[arr[0]][arr[1]], arr[2], {});
      Vue.set(obj[arr[0]][arr[1]][arr[2]], arr[3], val);        
    }
    if (arr.length == 5)
    {
      if (!obj[arr[0]]) Vue.set(obj, arr[0], {});
      if (!obj[arr[0]][arr[1]]) Vue.set(obj[arr[0]], arr[1], {});
      if (!obj[arr[0]][arr[1]][arr[2]]) Vue.set(obj[arr[0]][arr[1]], arr[2], {});
      if (!obj[arr[0]][arr[1]][arr[2]][arr[3]])Vue.set(obj[arr[0]][arr[1]][arr[2]], arr[3], {});
      Vue.set(obj[arr[0]][arr[1]][arr[2]][arr[3]], arr[4], val);
    }
  }
}