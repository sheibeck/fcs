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
        <a role="button" href="/campaign" class="btn btn-success d-print-none mb-1 mr-1">
          <i class="fas fa-chevron-circle-left"></i> Campaign List
        </a>
        <h3 class="mr-auto">{{campaign.name}} &mdash; Campaign</h3>
        <div class="d-flex p-1"> 
          <a class="mr-auto" :href="`/campaign-summary/${commonSvc.GetId(campaign.id)}/${campaign.slug}`" target="_blank">
            Public Campaign
            <i class="fas fa-external-link-alt"></i>
          </a>
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
            <button type="button" class="btn btn-primary btn-sm" @click="addSession()">
              <div class="d-flex">
                <i class="fas fa-book mt-1 mr-1"></i> <span class="d-none d-md-block">Add Session</span>
              </div>
            </button>            
            <span v-on:click="jumpTo('#summary')" class="d-md-none d-lg-none d-xl-none pt-1 ml-1"><i class="fas fa-arrow-circle-up"></i></span>
          </div>
          <div class="p-5 h2" v-if="isLoading">Loading sessions...</div>

          <div v-for="session in getSortedSessions" :key="session.id" class="mt-1" v-bind:class="{ 'mark': currentSession === session.id }">
            <div class="px-1 bg-light" :id="`editor-${commonSvc.GetId(session.id)}`">
              <div>
                <span v-if="currentSession !== session.id" class="badge badge-secondary">{{getNiceDate(session.date)}}</span>
                <span v-if="currentSession === session.id" class="input-group-sm">
                  <datetime v-model="session.date" type="datetime" @close="jumpTo(`#editor-${commonSvc.GetId(session.id)}`)"></datetime>
                </span>
              </div>
              <div class="d-flex">
                <span class="mt-2 mr-2 cursor">
                  <input type="checkbox" :id="'public-'+session.id" v-model="session.public" @change="saveSession(session)">
                  <label class="cursor" style="font-weight: 400;" :for="'public-'+session.id">public?</label>
                </span>
                <span class="mx-2 cursor" v-if="currentSession !== session.id" @click="setCurrentSession(session.id, session.description)"><i class="fas fa-edit pt-2 mt-1"></i> edit</span>
                <span class="mx-2 cursor" v-if="currentSession === session.id" @click="setCurrentSession('', '');saveSession(session);"><i class="fas fa-save pt-2 mt-1"></i> done</span>
                <span class="mx-2 mr-auto cursor" v-bind:data-id='session.id' data-toggle='modal' data-target='#modalDeleteSessionConfirm'><i class='fa fa-trash pt-2 mt-1'></i> delete</span>
                <span class="cursor" v-on:click="jumpTo('#logs')"><i class="fas fa-arrow-circle-up mt-1 pt-2"></i> scroll up</span>
              </div>
            </div>
            <textarea v-if="currentSession === session.id" placeholder="Session Information..." class="sessionLog form-control mb-2 bg-light" v-model="session.description" @focus="setOldSessionText($event)" @input="setCurrentSessionText($event)" @change="parseSession($event, session)"></textarea>
            <div class="card">
              <VueShowdown :extensions="['fcsCampaign']" v-if="currentSession === session.id" class="card-body" :markdown="currentSessionText" :options="{ emoji: false, openLinksInNewWindow: true, parseImgDimensions: true }"/>
              <VueShowdown :extensions="['fcsCampaign']" v-if="currentSession !== session.id" class="card-body" :markdown="session.description" :options="{ emoji: false, openLinksInNewWindow: true, parseImgDimensions: true }"/>
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
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
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
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
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
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
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
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div id="accordion" class="mt-2">
        <div class="card-header" id="campaignProperties">
          <button class="btn btn-link" data-toggle="collapse" data-target="#metadata" aria-expanded="true" aria-controls="metadata">
            Campaign Properties
          </button>
        </div>
        <div id="metadata" class="collapse" v-bind:class="{ 'show': isNewCampaign }" aria-labelledby="campaignProperties" data-parent="#accordion">
          <div class="card-body">
            <div class="form-group">
              <label for="name">Name</label>
              <input class="form-control" type="text" id="name" name="name" placeholder="Campaign name" v-model="campaign.name" @change="slugify">
            </div>
            <div class="form-group">
              <label for="scale">Scale</label>
              <select class="form-control" id="scale" name="scale" v-model="campaign.scale">
                <option>None</option>
                <option>Mundane</option>
                <option>Supernatural</option>
                <option>Otherworldly</option>
                <option>Legendary </option>
                <option>Godlike</option>
              </select>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea class="form-control" type="text" value="" id="description" name="description" placeholder="Campaign description..." v-model="campaign.description"></textarea>
            </div>
            <div class="form-group">
                <label for="imageUrl">Campaign Image Url</label>
                <input class="form-control" type="text" value="" id="imageUrl" name="imageUrl" placeholder="Image url" v-model="campaign.image_url" />
            </div>

            <button type="button" class="btn btn-primary" v-on:click="saveCampaign">Save Campaign</button>
          </div>
        </div>
      </div>

      <!-- delete confirmation modal-->
      <div class="modal fade" id="modalDeleteSessionConfirm" tabindex="-1" role="dialog" aria-labelledby="deleteLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="deleteLabel">Confirm Character Delete</h5>
                      <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <p>Are you sure you want to delete this session?</p>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-danger js-delete" v-on:click="deleteSession" data-dismiss="modal">Delete</button>
                      <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  </div>
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

showdown.extension('fcsCampaign', () => [
  {
    type: 'lang',
    //regex: /([#@!~])"(.+?)"(?:\s?\[(.*?)\])?/g,
    regex: /([#@!~])([\w\-]+|"\s*[^"]*\s*")(?:\s?\[(.*?)\])?/g,
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

      let displayDesc = description ? ` <mark>${description}</mark>` : "";

      return `<span class="text-${color}">${type}${thing}</span>${displayDesc}`;
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
    dbSvc = new DbService(this.$root);    
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
      currentSessionId: "",
      currentSessionValue: "",
      oldSessionValue: "",
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
    oldSessionText : {
      get : function() {
        return this.oldSessionValue;
      },
      set : function(value) {
        this.$set(this, 'oldSessionValue', value);
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
    init() {
      $(document).on('show.bs.modal', '#modalDeleteSessionConfirm', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var id = button.data('id') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        $(modal.find('.js-delete')).data('id', id);
      });
      
      this.parseSessionAll();
    },
    setCurrentSession(value, description) {
      this.currentSession = value;
      this.currentSessionText = description || "";
    },
    setCurrentSessionText(event) {
      //account for add session
      this.currentSessionText = event.target.value || "";
    },
    setOldSessionText(event) {
      //account for add session
      this.oldSessionText = event.target.value || "";
    },
    niceDescription(description) {
      if (description !== null) {
        var displayText = description.join(", ");
        if (/[#~!@]/.test(displayText)) {
          //add some html formatting so if we reference another thing in the description it looks nice
          displayText = displayText.replace(/[#]([\w\-]+|"\s*[^"]*\s*")/g,"<span class=\"text-success\">$1</span>");
          displayText = displayText.replace(/[!]([\w\-]+|"\s*[^"]*\s*")/g,"<span class=\"text-danger\">$1</span>");
          displayText = displayText.replace(/[@]([\w\-]+|"\s*[^"]*\s*")/g,"<span class=\"text-info\">$1</span>");
          displayText = displayText.replace(/[~]([\w\-]+|"\s*[^"]*\s*")/g,"<span class=\"text-muted\">$1</span>");
        }
        return displayText;
      } else {
        return "";
      }
    },
    niceThingDisplay(thing) {
      //cut out the special characters when displaying the thing names
      return thing.replace(/[#~!@]([\w\-]+|"\s*[^"]*\s*")/g,"$1");
    },
    parseSessionAll: function() {
      this.sessions.forEach( session => {                   
        this.parseThings(session.description, session.id);             
      });
    },
    parseSession: function(event, session) {
      //let newDescription = event.target.innerHTML;
      let newDescription = event.target.value;

      //find any thing that was added from this session and remove it
      this.parseThings(this.oldSessionText, session.id, true);

      //then update the data
      let idx = this.sessions.indexOf(session);
      if (idx > -1) {
        this.sessions[idx].description = newDescription;
      }

      //then add in anything that is from the new text
      this.parseThings(newDescription, session.id);

      this.saveSession(session);
    },
    parseThings: function(stringToParse, sessionId, removeThing){      
      var $component = this;      
      let regexString = `(?<thing>[#@!~](?<display>[\\w\\-]+|"\\s*[^"]*\\s*"))(?:\\s?\\[(?<description>.*?)\\])?`;      
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
    addSession : function() {
      //clear the filter without jumping
      this.$store.commit('updateSearchText', "");
      fcs.$options.filters.filterSessions();

      let session = {
        id: commonSvc.SetId("LOG", commonSvc.GenerateUUID()),
        object_type: "LOG",
        date: commonSvc.GetFormattedDate(new Date()),
        description: "Details...",
        related_id: this.campaign.id,
        owner_id: this.userId,
      };
      this.sessions.unshift(session);

      this.setCurrentSession(session.id);
      this.jumpTo(`#editor-${commonSvc.GetId(session.id)}`);
    },
    getNiceDate : function(date) {
        return commonSvc.GetNiceDate(date);
    },    
    deleteSession : function (event) {
      let $component = this;
      let sessionId = $(event.currentTarget).data('id');

      dbSvc.DeleteObject(this.userId, sessionId).then((response) => { 
        if (response) {       
          console.log("Deleted item:", JSON.stringify(response, null, 2));
          commonSvc.Notify('Session deleted.', 'success');

          // splice the item out of the list of sessions
          let session = $component.sessions.find(x => x.id === sessionId);
          //remove the things this session added
          $component.parseThings(session.description, session.id, true);
          let sessionIdx = $component.sessions.map(function(e) { return e.id; }).indexOf(sessionId);
          $component.sessions.splice(sessionIdx, 1);

          //clear out any search filters so we get the fresh view of the data
          $component.clearFilter()   
        }      
      })
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
      let sessionList = await dbSvc.ListRelatedObjects(campaignId);

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
    saveCampaign : function() {
      var $component = this;

      if (!this.campaign.name) {
        commonSvc.Notify('You must enter a name', 'error');
        return;
      }

      // make sure we have a proper user id key
      $component.$set($component.campaign, "owner_id", this.userId);

      //create a new campaign Id if we don't have one
      let isNew = false;
      if (!$component.campaign.id) {
          isNew = true;
          $component.$set($component.campaign, "id", `CAMPAIGN|${commonSvc.GenerateUUID()}`);
      }
  
      dbSvc.SaveObject($component.campaign).then( (response) => {
        if (response) {
          commonSvc.Notify('Campaign saved.', 'success', null, () => {;
            if (isNew) {
              location.href = '/campaign/' + commonSvc.GetId($component.campaign.id) + '/' + $component.campaign.slug;
            }
          });
        }
      });
    },    
    saveSession : function(session) {    
      //if we change the date, sometimes we lose the item when it sorts
      this.jumpTo(`#editor-${commonSvc.GetId(session.id)}`);      

      dbSvc.SaveObject(session).then( (response) => {  
        if (response) {      
          commonSvc.Notify('Session saved.', 'success');
        }
      });
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
