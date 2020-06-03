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
      <div class="d-flex flex-column flex-sm-row">
        <h3 class="mr-auto">{{campaign.name}} &mdash; Campaign</h3> <a class="" :href="`/campaign-summary/${commonSvc.GetId(campaign.id)}/${campaign.slug}`" target="_blank">Public Campaign Summary <i class="fas fa-link"></i></a>
      </div>

      <div id="accordion">
        <div class="card-header" id="campaignProperties">
          <button class="btn btn-link" data-toggle="collapse" data-target="#metadata" aria-expanded="true" aria-controls="metadata">
            Campaign Properties
          </button>
        </div>
        <div id="metadata" class="collapse" v-bind:class="{ 'show': isNewCampaign }" aria-labelledby="campaignProperties" data-parent="#accordion">
          <div class="card-body">
            <div class="form-group">
              <label for="name">Name</label>
              <input class="form-control" type="text" id="name" name="name" aria-describedby="titleHelp" placeholder="Campaign name" v-model="campaign.name" @change="slugify">
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
                <label for="imageUrl">Description</label>
                <input class="form-control" type="text" value="" id="imageUrl" name="imageUrl" placeholder="Image url" v-model="campaign.image_url" />
            </div>

            <button type="button" class="btn btn-primary" v-on:click="saveCampaign">Save Campaign</button>
          </div>
        </div>
      </div>
      <div class="row mt-2" v-if="!isNewCampaign">
        <!-- session logs -->
        <div class="col-12 col-md-7 col-lg-8 order-2 order-md-1" id="logs">
          <div class="header d-flex">
            <span class="h4">Session Log</span>
              <i class="fas fa-question-circle pl-1 pt-1 mr-auto" data-toggle="modal" data-target="#modalInstructions"></i>
            <button type="button" class="btn btn-warning btn-sm mr-1" v-show="isFiltered" v-on:click="clearFilter()"><i class="fas fa-times"></i> Clear Filter</button>
            <button type="button" class="btn btn-primary btn-sm" @click="addSession()"><i class="fas fa-book"></i> Add Session</button>
            <span v-on:click="jumpTo('#summary')" class="d-md-none d-lg-none d-xl-none pt-1 ml-1"><i class="fas fa-arrow-circle-up"></i></span>
          </div>
          <div class="p-5 h2" v-if="isLoading">Loading sessions...</div>

          <div v-for="session in filteredSessions" :key="session.id" class="mt-1" v-bind:class="{ 'mark': currentSession === session.id }">
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
              <VueShowdown :extensions="['fcsCampaign']" v-if="currentSession === session.id" class="card-body" :markdown="currentSessionText"/>
              <VueShowdown :extensions="['fcsCampaign']" v-if="currentSession !== session.id" class="card-body" :markdown="session.description"/>
            </div>
          </div>
        </div>

        <!-- important things -->
        <div class="col-12 col-md-5 col-lg-4 order-1 order-md-2" id="summary">
          <div class="d-flex header">
            <h4 class="mr-auto">Important Things</h4> <span class="d-md-none d-lg-none d-xl-none" v-on:click="jumpTo('#logs')">scroll down <i class="fas fa-arrow-circle-down"></i></span>
          </div>
          <div class="">
            <h5><span class="text-danger">!</span>Issues</h5>
            <ul>
              <li v-for="thing in sortedAlphaSessions" :key="thing.id">
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <span class="badge badge-secondary">x{{thing.sessionids.length}}</span>
                <button class="btn btn-link p-0 text-danger" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
              </li>
            </ul>

            <h5><span class="text-success">#</span>Characters</h5>
            <ul>
              <li v-for="thing in sortedAlphaCharacters" :key="thing.id">
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <span class="badge badge-secondary">x{{thing.sessionids.length}}</span>
                <button class="btn btn-link p-0 text-success" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
              </li>
            </ul>

            <h5><span class="text-info">@</span>Faces &amp; Places</h5>
            <ul>
              <li v-for="thing in sortedAlphaFacePlaces" :key="thing.id">
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <span class="badge badge-secondary">x{{thing.sessionids.length}}</span>
                <button class="btn btn-link p-0 text-info" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
              </li>
            </ul>

            <h5><span class="text-muted">~</span>Campaign Aspects</h5>
            <ul>
              <li v-for="thing in sortedAlphaAspects" :key="thing.id">
                <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <span class="badge badge-secondary">x{{thing.sessionids.length}}</span>
                <button class="btn btn-link p-0 text-muted" type="button" @click="copyThingToClipboard(thing.thing)">{{niceThingDisplay(thing.thing)}}</button>
                <small class="" v-bind:class="{ 'mark': niceDescription(thing.description) }" v-html="niceDescription(thing.description)"></small>
              </li>
            </ul>
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

      <!-- instruction modal -->
      <div class="modal fade" id="modalInstructions" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Instructions</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
                <h5>Public Sessions</h5>
                <p>
                  Marking a session as public will make the session show up on the Public Campaign Summary page. Any <b>extra details</b> (see below) will not
                  show up in the campaign summary which will allow you to add these details but keep them for the GM's eyes only.
                </p>
                <h5>Session Editing</h5>
                <p>
                  The sessions can use markdown to format the text you type. This website uses ShodownJs for rendering markdown. The full list of supported
                  markdown can be found at <a href="https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax" target="_blank">ShowdownJs</a>.
                </p>
                <p>
                  Additionally, there are custom tags specific to Fate Character Sheet. These tags will automatically populate
                  the Important Things section when you use them. This allows you to see important things about your campaign at a glance.
                  Currently supported tags are:
                </p>
                <ul>
                  <li><strong class="text-danger">#"</strong>Character Name<strong class="text-danger">"</strong></li>
                  <li><strong class="text-danger">~"</strong>Campaign Aspect<strong class="text-danger">"</strong></li>
                  <li><strong class="text-danger">!"</strong>Issue Description<strong class="text-danger">"</strong></li>
                  <li><strong class="text-danger">@"</strong>Face or Place Name<strong class="text-danger">"</strong></li>
                </ul>
                <p>Additionally, you can associate <b>extra details</b> to any tag by enclosing the text in square brackets and making sure it come right
                  after the tagged item (be sure to include the space between the tag and the brackets). For example:</p>
                <blockquote> <strong class="text-danger">!"</strong>An impending issue<strong class="text-danger">"</strong> <strong class="text-danger">[</strong>this issue becomes active if the characters mess up<strong class="text-danger">]</strong></blockquote>

                <h5>Important Things</h5>
                <ul>
                  <li>Copy a tag to your clipboard by clicking on the tagged item</li>
                  <li>Filter your sessions logs by clicking on the Filter icon (<i class="fas fa-filter"></i>)</li>
                  <li>The badge with the number (<span class="badge badge-secondary">x3</span>) is how many times this tag has been used in your session logs (this does not include tags used inside extra info)</li>
                  <li>Hilighted items (<mark>that look like this</mark>) are a list of all the extra details that have been added to this tag. These items will not show up in the public campaign summary</li>
                </ul>
            </div>
            <div class="modal-footer">
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
import VueShowdown, { showdown } from 'vue-showdown';
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
  mounted(){
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
        //return this.$store.state.sessions;
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
          let displayText =  `${display} ${description ? "[" + description + "]" : ""}`;

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
        id: commonSvc.GenerateUUID(),
        object_type: "LOG",
        date: this.getFormattedDate(new Date()),
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
    getFormattedDate : function(date) {
      var year = date.getFullYear();

      var month = (1 + date.getMonth()).toString();
      month = month.length > 1 ? month : '0' + month;

      var day = date.getDate().toString();
      day = day.length > 1 ? day : '0' + day;

      var time = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: false, minute: 'numeric' });

      let dateString =  year + '-' + month + '-' + day + 'T' + time;

      return dateString;
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
        "name": "New Campaign",
        "date": this.getFormattedDate(new Date()),
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
