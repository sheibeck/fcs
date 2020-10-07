<style lang="scss" scoped>  

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

  .sessionLog {
    max-height: 500px;
    overflow-y: scroll;   
  }

  .card-body {
    padding: .5em;
  }
  
  #summary {
    ul { 
      padding-left: 10px;

      li {
        list-style: none;
      }
    }
  }
</style>

<template>
  <div class="container mt-2">

    <loading :loading="isLoading" />

    <div v-if="!isLoading">     
      <div class="d-flex">
        <h3 class="mr-auto">{{campaign.name}} - Campaign Summary</h3>
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
              <VueShowdown :extensions="['fcsCampaignHidden']" class="card-body" :options="{ emoji: false, openLinksInNewWindow: true, parseImgDimensions: true }" :markdown="session.description"/>
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
import { mapGetters } from 'vuex';
import VueShowdown, { showdown } from 'vue-showdown';
import NamedRegExp from 'named-regexp-groups';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import Loading from '../components/loading';

let commonSvc = null;
let dbSvc = null;

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
       title: `${this.campaign ? this.campaign.name : this.title}`,  
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  components: {    
    loading: Loading
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);    
    this.parseSessionAll();  
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.campaignId = commonSvc.SetId("CAMPAIGN", fcs.$route.params.id);
      this.getCampaign(this.campaignId);
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
      'searchText',      
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
     commonSvc() {
      return commonSvc;
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
      let regex = new NamedRegExp(regexString, "g");
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

          let newThing = {id: commonSvc.GenerateUUID(), sessionids: [sessionId], thing: thing, description: null} 
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
      commonSvc.CopyTextToClipboard(text);
    },
    getCampaign : async function(id) {

      let campaign = await dbSvc.GetObject(id);

      if (!campaign)
      {
          location.href = '/error';
      }
      else {
          console.log("Success", campaign);         
          this.$set(this, 'campaign', campaign);              
          this.listSessions(campaign.id);

          this.title = campaign.name + ' (Campaign)';
          this.description = campaign.description || "";
      }
    },
    listSessions : async function(campaignId) {      
      let sessionList = await dbSvc.ListRelatedObjects(campaignId, true);

      if (sessionList && sessionList.length > 0) {
        this.sessions = sessionList;
        this.parseSessionAll();
      }

      this.loading = false;
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
        return commonSvc.GetNiceDate(date);
    },
    jumpTo : function(section) {
      $("html, body").animate({ scrollTop: $(section).offset().top }, 500);
    }
  }
}
</script>
