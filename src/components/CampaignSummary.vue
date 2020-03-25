<style type="text/css">  
    ul li.disabled {
        cursor: default;
        text-decoration: line-through;
    }
    label {
      font-weight: 700;
    }

    .fa-question-circle,
    .fa-filter,
    .fa-arrow-circle-down,
    .fa-arrow-circle-up,
    .cursor {
      cursor: pointer;
      color: #888;
    }     

    .badge-secondary {
      background-color: #ccc;
      height: 50%;
      margin-top: 10px;
    }

    .header {
      border-bottom: solid 1px black;
    }  
    
    textarea {
      height: 150px;
    }

    .sessionLog {
      max-height: 500px;
      overflow-y: scroll;
    }

    .card-body {
      padding: .5em;
    }

    #summary ul li {
      list-style: none;
    }

    #summary ul {
      padding-left: 10px;
    }
</style>

<template>
  <div class="container mt-2">

    <div class="d-flex justify-content-center" v-if="isLoading">
      <div class="p-5 h2">Loading ... <i class="fas fa-cog fa-spin"></i></div>
    </div>

    <div v-else>     
      <div class="d-flex">
        <h3 class="mr-auto">{{campaign.title}} - Campaign Summary</h3>
      </div>

      <div class="row mt-2">
        <!-- session logs -->
        <div class="col-12 col-md-8 order-2 order-md-1" id="logs">        
          <div class="header d-flex">
            <span class="h4 mr-auto">Session Log</span>              
            <button type="button" class="btn btn-warning btn-sm mr-1" v-show="isFiltered" v-on:click="clearFilter()"><i class="fas fa-times"></i> Clear Filter</button> 
            <span v-on:click="jumpTo('#summary')" class="d-md-none d-lg-none d-xl-none pt-1 ml-1"><i class="fas fa-arrow-circle-up"></i></span>
          </div>
          <div v-if="filteredSessions.length === 0">
            <div class="p-5 h4 text-info"><i>There are no public sessions for this campaign. Contact the storyteller and ask them to share some sessions!</i></div>
          </div>
          <div v-else v-for="session in filteredSessions" :key="session.id" class="mt-1">
            <div class="d-flex p-1 pt-0 bg-light">            
              <span class="badge badge-secondary mt-1 mr-2 mr-auto">{{getNiceDate(session.date)}}</span>            
              <span class="cursor" v-on:click="jumpTo('#logs')"><i class="fas fa-arrow-circle-up"></i> scroll up</span>              
            </div>            
            <div class="card">              
              <VueShowdown :extensions="['fcsCampaignHidden']" class="card-body" :markdown="session.description"/>
            </div>
          </div>
        </div>

        <!-- campaign summary -->      
        <div class="col-12 col-md-4 order-1 order-md-2" id="summary">
          <div class="d-flex header">
            <h4 class="mr-auto">Important Things</h4> <span class="d-md-none d-lg-none d-xl-none" v-on:click="jumpTo('#logs')">scroll down <i class="fas fa-arrow-circle-down"></i></span>
          </div>
          <div class="">
            <h5><span class="text-danger">!</span>Issues</h5>
            <ul>
              <li v-for="thing in sortedAlphaSessions" :key="thing.id">
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i>
                <button class="btn btn-link p-0 text-danger" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>                 
              </li>
            </ul>

            <h5><span class="text-success">#</span>Characters</h5>
            <ul>
              <li v-for="thing in sortedAlphaCharacters" :key="thing.id">
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i>
                <button class="btn btn-link p-0 text-success" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>                
              </li>
            </ul>

            <h5><span class="text-info">@</span>Faces &amp; Places</h5>
            <ul>
              <li v-for="thing in sortedAlphaFacePlaces" :key="thing.id">              
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i>
                <button class="btn btn-link p-0 text-info" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>                
              </li>
            </ul> 

            <h5><span class="text-muted">~</span>Campaign Aspects</h5>
            <ul>
              <li v-for="thing in sortedAlphaAspects" :key="thing.id">
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i>
                <button class="btn btn-link p-0 text-muted" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>                
              </li>
            </ul>  
          </div>
        </div>
      </div>

  
    </div>  
  </div>  
</template>

<script>
import { mapGetters } from 'vuex'
import VueShowdown, { showdown } from 'vue-showdown'

showdown.extension('fcsCampaignHidden', () => [ 
  {
    type: 'lang',
    regex: /([#@!~])"(.+?)"(?:\s?\[(.*?)\])?/g,
    replace: function (wm, type, thing, description) { 
      let color = "success";
      switch(type) {
        case "#":
          color = "success";
          break;
        case "!":
          color = "danger";
          break;
        case "@":
          color = "info";
          break;
        case "~":
          color = "muted";
          break;
      }      

      return `<span class="text-${color}">${type}${thing}</span>`;
    }  
  },
])

export default {
  name: 'CampaignDetail',
  metaInfo() {
    return {
       title: this.title,       
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  created(){
    fs_camp.init();        
  },
  mounted(){
    this.parseSessionAll();
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.getCampaign(fcs.$route.params.id);      
    }
  },
  data () {
    return {
      title: "",
      description: "",
      loading: true,    
      campaign : {},    
      currentSessionId: "",
      currentSessionValue: "",
      id: this.$route.params.id,      
      tags: ["#","@","!","~"],
      things: {
        characters: [],
        faceplaces: [],
        issues: [],
        aspects: [],
      },
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'sessions',
      'filteredSessions',
      'searchText'
    ]),
    isNewCampaign : function() {
      return this.$route.params.id === "create";
    },    
    sessions : {
      get : function() {
        return this.$store.state.sessions.sort((a, b) => (new Date(a.date) < new Date(b.date)) ? 1 : -1);
      },
      set : function(value) {        
        this.$store.commit('updateSessions', value);
      }
    },
    currentSession : {
      get : function() {
        return this.currentSessionId
      },
      set : function(value) {
        this.$set(this, 'currentSessionId', value); 
      }
    },   
    currentSessionText : {
      get : function() {
        return this.currentSessionValue;
      },
      set : function(value) {
        this.$set(this, 'currentSessionValue', value);  
      }
    },
    isFiltered : function() {
      return this.$store.state.searchText;
    },
    isLoading : function() {
      return this.loading;
    },
    sortedAlphaSessions : function() {
      return this.things.issues.sort((a, b) => (a.thing > b.thing) ? 1 : -1);
    },
    sortedAlphaCharacters : function() {
      return this.things.characters.sort((a, b) => (a.thing > b.thing) ? 1 : -1);
    },
    sortedAlphaFacePlaces : function() {
      return this.things.faceplaces.sort((a, b) => (a.thing > b.thing) ? 1 : -1);
    },
    sortedAlphaAspects : function() {
      return this.things.aspects.sort((a, b) => (a.thing > b.thing) ? 1 : -1);
    },
  },
  methods: { 
    niceDescription(description) {
      if (description !== null) {
        var displayText = description.join(", ");
        if (/[#~!@]/.test(displayText)) {
          //add some html formatting so if we reference another thing in the description it looks nice
          displayText = displayText.replace(/[#]"(.+?)"/g,"<span class=\"text-success\">$1</span>");
          displayText = displayText.replace(/[!]"(.+?)"/g,"<span class=\"text-danger\">$1</span>");
          displayText = displayText.replace(/[@]"(.+?)"/g,"<span class=\"text-info\">$1</span>");
          displayText = displayText.replace(/[~]"(.+?)"/g,"<span class=\"text-muted\">$1</span>");
        }
        return displayText;
      } else {
        return "";
      }
    },
    niceThingDisplay(thing) {
      //cut out the special characters when displaying the thing names
      return thing.replace(/[#~!@]"(.+?)"/g,"$1");
    },
    parseSessionAll: function() {
      if (this.sessions && this.sessions.length > 0) {        
        for(let i = 0; i < this.sessions.length; i++) {
          let session = this.sessions[i];
          this.parseThings(session.description, session.id);
        }
      }      
    },    
    parseThings: function(stringToParse, sessionId, removeThing){
      var $component = this;      
      let regexString = `(?<thing>[#@!~]"(?<display>.+?)")(?:\\s?\\[(?<description>.*?)\\])?`;
      let regex = new RegExp(regexString, "g");
      let match = regex.exec(stringToParse);

      let listToUpdate = null;
      while (match != null) {
        //we only are looking at the primary tag, this way we can put 
        // tags into the descriptors as well, but really we are only tagging
        // the primary thing
        let thingToMatch = match[1];
        
        if (thingToMatch.includes("#")) {
          listToUpdate = $component.things.characters;          
        }

        if (thingToMatch.includes("@")) {
          listToUpdate = $component.things.faceplaces;
        }

        if (thingToMatch.includes("!")) {
          listToUpdate = $component.things.issues;
        }

        if (thingToMatch.includes("~")) {
          listToUpdate = $component.things.aspects;          
        }         
                
        $component.updateThing(listToUpdate, sessionId, match, removeThing);
        match = regex.exec(stringToParse);
      }      
    },
    findThing: function(list, value) { 
      //find a thing in the things lists     
      if (list) {
        for(let i = 0; i < list.length; i++) {
            if(list[i]["thing"] === value) {
                return i;
            }
        }
      }
      return -1;
    },
    findThingForSession: function(list, value, sessionId) { 
      //find a thing in the things list that is associated with a specific sessionId 
      if (list) {    
        for(let i = 0; i < list.length; i++) {
            if(list[i]["thing"] === value && list[i].sessionids.indexOf(sessionId) > -1) {
                return list[i].sessionids.indexOf(sessionId);
            }
        }
      }
      return -1;
    },
    updateThing : function(list, sessionId, match, removeThing) {
      //we want secret stuff here, so never show a description
      let thing = match.groups.thing;
      let display = match.groups.display;
      let description = null;
      
      //crud functions on a thing in the things list
      let thingIdx = this.findThing(list, thing)
      let thingInSessionIdx = this.findThingForSession(list, thing, sessionId)

      //if we are not removing
      if (!removeThing) { 

        //if the thing does not exist at all, add it and associate it with this session
        if (thingIdx === -1) {         
          let displayText =  `${display}`;

          let newThing = {id: fatesheet.generateUUID(), sessionids: [sessionId], thing: thing, description: null} 
          list.unshift(newThing);
        }
        
        //if the thing exists but not for this session, associate it with this session
        if(thingIdx > -1) {
          if (thingInSessionIdx === -1) {
            list[thingIdx].sessionids.unshift(sessionId);
          }         
        }
      }      
    }, 
    copyThingToClipboard : function(text) {  
      var tempInput = document.createElement("input");
      tempInput.style = "position: absolute; left: -1000px; top: -1000px";
      tempInput.value = text;
      console.log(text);

      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);

      fatesheet.notify('Copied thing to clipboard', 'info', 2000);      
    },
    getCampaign : async function(id) {
      var $component = this;
      let campaignList = [];

      // Create DynamoDB document client
      let docClient = fatesheet.getDBClient();

      let params = {
          TableName: fs_camp.config.campaigntable,
          IndexName: "campaign_id-index",
          KeyConditionExpression: 'id = :id',
          ExpressionAttributeValues: {            
            ':id': id,
          },         
      }

      docClient.query(params, onQuery);
      
      function onQuery(err, data) {
        if (err) {
          console.log("Error", err);
        } 
        else {
          Array.prototype.push.apply(campaignList,data.Items);
          
          if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.query(params, onQuery);
          }
          else {
            if (campaignList.length === 0)
            {
              location.href = '/error';
            }
            else {
              console.log("Success", campaignList[0]);
              let c = campaignList[0];
              $component.$set($component, 'campaign', c);              
              $component.listSessions(c.id);

              $component.title = c.title + ' (Campaign)';
              $component.description = c.description || "";
            }
          }
        }
      }
    },
    listSessions : function(id) {        
      var $component = this;
      let sessionList = [];

      // Create DynamoDB document client
      let docClient = fatesheet.getDBClient();

      let params = {
          TableName: fs_camp.config.campaigntable,
          KeyConditionExpression: 'owner_id = :owner_id',
          FilterExpression: '(parent_id = :parent_id) AND (ispublic = :is_public)',
          ExpressionAttributeValues: {            
            ':owner_id': this.campaign.owner_id,
            ':parent_id': id,
            ':is_public': true,
          },         
      }

      docClient.query(params, onQuery);
      
      function onQuery(err, data) {
        if (err) {
          console.log("Error", err);
        } 
        else {           
          Array.prototype.push.apply(sessionList,data.Items);

          if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("Scanning for more...");                  
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.query(params, onQuery);
          }
          else {
            console.log("Success", sessionList);              

            if (sessionList && sessionList.length > 0) {
              $component.sessions = sessionList;
              $component.parseSessionAll();
            }

            $component.loading = false;
          }
        }        
      }
    },    
    filterBy : function(thing) {
      this.$store.commit('updateSearchText', thing);
      fcs.$options.filters.filterSessions();
      this.jumpTo("#logs");
    },    
    clearFilter : function() {
      this.$store.commit('updateSearchText', "");
      fcs.$options.filters.filterSessions();
      this.jumpTo("#summary");
    },
    getNiceDate : function(date) {
        return new Date(date).toLocaleString();
    },
    jumpTo : function(section) {
      $("html, body").animate({ scrollTop: $(section).offset().top }, 500);
    }
  }
}
</script>
