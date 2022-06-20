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

  #logs {
    textarea {
      min-height: 150px;
    }
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
      padding-left: 5px;

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
      <div class="d-flex flex-column flex-sm-row">        
        <h3 class="mr-auto">{{campaign.name}} &mdash; Campaign</h3>
        <div class="d-flex p-1"> 
          <div class="mr-auto"></div>
          <button v-if="!showimportant" title="Show Important Things" @click="showimportant = true" type="button" class="btn btn-link d-sm-block d-md-none p-0 m-0">
            Show Important <i class="fas fa-angle-double-left"></i>
          </button>
          <button v-if="showimportant" title="Hide Important Things" @click="showimportant = false" type="button" class="btn btn-link d-sm-block d-md-none m-0 p-0 pl-1">
            Hide Important <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
      </div>
      
      <div class="d-flex flex-column flex-md-row" v-if="!isNewCampaign">
        <!-- session logs -->
        <div class="order-2 order-md-1 px-1 col-12" :class="{ 'col-md-7':showimportant, 'col-lg-8':showimportant }" id="logs">
          <div class="header d-flex">
            <span class="h4">Session Log</span>
            <a class="pl-1 pt-1 mr-auto" target="_blank" href="https://github.com/sheibeck/fcs/wiki/Campaigns"><i class="fas fa-question-circle"></i></a>
            <button type="button" v-if="sortDescending" @click="sortDescending = false" class="btn btn-secondary btn-sm mr-1">
              <div class="d-flex">
                <i class="fas fa-sort-amount-down mt-1 mr-1"></i><span class="d-none d-md-block">Sort</span>
              </div>
            </button>
            <button type="button" v-if="!sortDescending" @click="sortDescending = true" class="btn btn-secondary btn-sm mr-1">
              <div class="d-flex">
                <i class="fas fa-sort-amount-up mt-1 mr-1"></i><span class="d-none d-md-block">Sort</span>
              </div>
            </button>
            <button type="button" class="btn btn-warning btn-sm mr-1" v-show="isFiltered" v-on:click="clearFilter()">
              <div class="d-flex">
                <i class="fas fa-times mt-1 mr-1"></i> <span class="d-none d-md-block">Clear Filter</span>
              </div>
            </button>            
            <span v-on:click="jumpTo('#summary')" class="d-md-none d-lg-none d-xl-none pt-1 ml-1"><i class="fas fa-arrow-circle-up"></i></span>
          </div>
          <div class="p-5 h2" v-if="isLoading">Loading sessions...</div>

          <div v-for="session in getSortedSessions" :key="session.id" class="mt-1">              
            <div class="d-flex">
              <span class="badge badge-secondary mr-auto">{{getNiceDate(session.date)}}</span>
              <span class="cursor" v-on:click="jumpTo('#logs')"><i class="fas fa-arrow-circle-up mt-1 pt-2"></i> scroll up</span>
            </div>
                        
            <div class="card">                            
              <VueShowdown :extensions="['fcsCampaignHidden']" class="card-body" :options="{ emoji: false, openLinksInNewWindow: true, parseImgDimensions: true }" :markdown="session.description"/>
            </div>
          </div>
        </div>

        <div v-if="!showimportant" class="order-1 order-md-2 d-none d-md-block" id="summary">
          <button title="Show Important Things" @click="showimportant = true" type="button" class="btn btn-link"><i class="fas fa-angle-double-left"></i></button>
        </div>

        <!-- important things -->
        <div v-if="showimportant" class="order-1 order-md-2 px-1 col-12 col-md-5 col-lg-4" id="summary">
          <div class="d-flex header">
            <h4 class="mr-auto">
              Important Things               
            </h4> 
            <span class="d-md-none mt-1" v-on:click="jumpTo('#logs')">scroll down <i class="fas fa-arrow-circle-down"></i></span>
            <button title="Hide Important Things" @click="showimportant = false" type="button" class="btn btn-link d-none d-md-block m-0 p-0 pl-1">
                <i class="fas fa-angle-double-right"></i>
            </button>
          </div>
          <div class="">
            <h5><span class="text-danger">!</span>Issues</h5>
            <ul>
              <li v-for="thing in sortedAlphaSessions" :key="thing.id" class="d-flex">
                <div class="d-flex align-self-center pr-1">
                  <i class="fas fa-filter pr-1" v-on:click="filterBy(thing.thing)"></i>
                  <span class="badge badge-secondary mt-0">x{{thing.sessionids.length}}</span>
                </div>
                <button class="btn btn-link p-0 text-danger text-left" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>                
              </li>
            </ul>

            <h5><span class="text-success">#</span>Characters</h5>
            <ul>
              <li v-for="thing in sortedAlphaCharacters" :key="thing.id" class="d-flex">
                <div class="d-flex align-self-center pr-1">
                  <i class="fas fa-filter pr-1" v-on:click="filterBy(thing.thing)"></i>
                  <span class="badge badge-secondary mt-0">x{{thing.sessionids.length}}</span>
                </div>
                <button class="btn btn-link p-0 text-success text-left" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>                
              </li>
            </ul>

            <h5><span class="text-info">@</span>Faces &amp; Places</h5>
            <ul>
              <li v-for="thing in sortedAlphaFacePlaces" :key="thing.id" class="d-flex">
                <div class="d-flex align-self-center pr-1">
                  <i class="fas fa-filter pr-1" v-on:click="filterBy(thing.thing)"></i>
                  <span class="badge badge-secondary mt-0">x{{thing.sessionids.length}}</span>
                </div>
                <button class="btn btn-link p-0 text-info text-left" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>
              </li>
            </ul>

            <h5><span class="text-muted">~</span>Campaign Aspects</h5>
            <ul>
              <li v-for="thing in sortedAlphaAspects" :key="thing.id" class="d-flex">
                <div class="d-flex align-self-center pr-1">
                  <i class="fas fa-filter pr-1" v-on:click="filterBy(thing.thing)"></i>
                  <span class="badge badge-secondary mt-0">x{{thing.sessionids.length}}</span>
                </div>
                <button class="btn btn-link p-0 text-muted text-left" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>                
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
import { showdown } from 'vue-showdown';
import { Datetime } from 'vue-datetime';
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
    datetime: Datetime,
    loading: Loading
  },
  created(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root, true);
    this.init();    
  },  
  watch: {
    userId() {
      //wait for our authenticated user id
      this.campaignId = commonSvc.SetId("CAMPAIGN", fcs.$route.params.id);
      this.getCampaign(this.userId, this.campaignId);
    }
  },
  data () {
    return {
      name: "",
      description: "",
      loading: true,
      showimportant: true,
      campaign : {},            
      id: this.$route.params.id,
      tags: ["#","@","!","~"],
      things: {
        characters: [],
        faceplaces: [],
        issues: [],
        aspects: [],
      },
      sortDescending: false,
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
    getSortedSessions : function() {
      if (this.sortDescending) {
        return this.filteredSessions.sort((a, b) => (new Date(a.date) < new Date(b.date)) ? -1 : 1);
      }
      
      return this.filteredSessions.sort((a, b) => (new Date(a.date) < new Date(b.date)) ? 1 : -1);      
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
    init() {      
      this.parseSessionAll();
    },        
    niceThingDisplay(thing) {
      //cut out the special characters when displaying the thing names
      return thing.replace(/[#~!@]"(.+?)"/g,"$1");
    },
    parseSessionAll: function() {
      this.sessions.forEach( session => {
        this.parseThings(session.description, session.id);             
      });
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
      let thing = match.groups.thing;
      let display = match.groups.display;
      let description = match.groups.description || null;

      //crud functions on a thing in the things list
      let thingIdx = this.findThing(list, thing)
      let thingInSessionIdx = this.findThingForSession(list, thing, sessionId)

      //if we are not removing
      if (!removeThing) {

        //if the thing does not exist at all, add it and associate it with this session
        if (thingIdx === -1) {
          let newThing = {id: commonSvc.GenerateUUID(), sessionids: [sessionId], thing: thing, description: [description] || null}
          list.unshift(newThing);
        }

        //if the thing exists but not for this session, associate it with this session
        if(thingIdx > -1) {
          if (thingInSessionIdx === -1) {
            list[thingIdx].sessionids.unshift(sessionId);
          }
          if (description && list[thingIdx].description && list[thingIdx].description.indexOf(description) === -1) {
            list[thingIdx].description.unshift(description);
            list[thingIdx].display = `${display} ${description.length > 0 ? "[" + list[thingIdx].description.join(", ") + "]" : ""}`;
          }
        }
      }

      //if we are removing, remove the association of this thing to this session
      if (removeThing && thingIdx > -1) {
        if (thingInSessionIdx > -1) {
          list[thingIdx].sessionids.splice(thingInSessionIdx, 1);
        }

        //if there are no more sessions associated with this thing, then remove it entirely
        if (list[thingIdx].sessionids.length === 0) {
          list.splice(thingIdx, 1);
        }

        //remove any descriptions that went with this item
        if (description && list[thingIdx] && list[thingIdx].description) {
          let descIdx = list[thingIdx].description.indexOf(description);
          if (descIdx > -1) {
            list[thingIdx].description.splice(descIdx, 1);
            //update the display
            list[thingIdx].display = `${display} ${description.length > 0 ? "[" + list[thingIdx].description.join(", ") + "]" : ""}`;
          }
        }
      }
    },
  
    copyThingToClipboard : function(text) {
      commonSvc.CopyTextToClipboard(text);      
    },
    
    getNiceDate : function(date) {
        return commonSvc.GetNiceDate(date);
    },    
  
    getCampaign : function(ownerId, id) {
      var $component = this;

      if (this.id === "create") {
        this.create();
        return;
      }

      dbSvc.GetObject(id, ownerId).then ( (response) => {   
        if (!response)
        {
          commonSvc.Notify(`Could not find campaign with id <b>${commonSvc.GetId(id)}</b>`, 'error', 2000, () => {
            document.location = '/campaign';
          });
        }
        else {              

          $component.$set($component, 'campaign', response);
          $component.listSessions(response.id);

          $component.name = $component.campaign.name + ' (Campaign)';
          $component.description = $component.campaign.description || "";
        }

        $component.loading = false;    
      })
    },
    listSessions : async function(campaignId) {
      let sessionList = await dbSvc.ListRelatedObjects(campaignId, true);

      if (sessionList && sessionList.length > 0) {
        this.sessions = sessionList;
        this.parseSessionAll();
      }

      this.loading = false;
    },
    create : function() {
      let c = {
        "description": "",
        "object_type": "CAMPAIGN",
        "id": null,
        "owner_id": this.userId,        
        "scale": "",
        "slug": "new-campaign",
        "name": "Campaign Name",
        "date": commonSvc.GetFormattedDate(new Date()),
      };
      this.$set(this, 'campaign', c);
      this.loading = false;
    },   
    filterBy : function(thing) {
      this.$store.commit('updateSearchText', thing);
      fcs.$options.filters.filterSessions();
      this.jumpTo("#logs");
    },
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    },
    clearFilter : function() {
      this.$store.commit('updateSearchText', "");
      fcs.$options.filters.filterSessions();
      this.jumpTo("#summary");
    },
    jumpTo : function(section) {      
      //give the ui time to make sure the id exists
      setTimeout(function() {
        $("html, body").animate({ scrollTop: $(section).offset().top }, 100);
      }, 100);
    },
    slugify : function(event) {
      let $elem = $(event.currentTarget);
      let slug = commonSvc.Slugify($elem.val());
      this.$set(this.campaign, "slug", slug);
    }
  }
}
</script>
