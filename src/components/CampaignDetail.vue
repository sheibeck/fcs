<style type="text/css">  
    ul li.disabled {
        cursor: default;
        text-decoration: line-through;
    }
    label {
      font-weight: 700;
    }

    .fa-question-circle,
    .fa-filter {
      cursor: pointer;
      color: #ccc;
    }

    .header {
      border-bottom: solid 1px black;
    }

    h1 {
      font-size: 1.3em;
    }

    h4, .h4 {
      font-size: 1.2em;
    }
    
    textarea {
      height: 150px;
    }
</style>

<template>
  <div class="container mt-2">
    <input type="hidden" name="id" id="id" v-model="campaign.id" />
    <input type="hidden" name="owner_id" v-model="campaign.owner_id" id="owner_id" />
    <input type="hidden" name="date" v-model="campaign.date" id="date" />
    <input type="hidden" name="parent_id" v-model="campaign.parent_id" id="parent_id" />

    
    <div class="d-flex">
      <h1 class="mr-auto">{{campaign.title}} - Campaign</h1> <span class="badge badge-warning pt-1 mt-1 mb-2" style="cursor:pointer;" v-show="isFiltered" v-on:click="clearFilter()">x Clear Filter</span>
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
            <input class="form-control" type="text" id="name" name="name" aria-describedby="titleHelp" placeholder="Campaign name" v-model="campaign.title" @change="slugify">
            <!--<small id="titleHelp" class="form-text text-muted">https://fatecharactersheet.com/campaign/{{campaign.id}}/{{campaign.slug}}</small> -->
          </div>        
          <div class="form-group">
            <label for="scale">Scale</label>
            <select class="form-control" id="scale" name="scale" v-model="campaign.scale" @change="saveCampaign">
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
              <textarea class="form-control" type="text" value="" id="description" name="description" placeholder="Campaign description..." v-model="campaign.description" @change="saveCampaign"></textarea>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-2">
      <div class="col-12 col-md-8 col-lg-6">        
        <div class="header d-flex">
          <span class="h4">Session Log</span>&nbsp;<i class="fas fa-question-circle pt-1 mr-auto" data-toggle="modal" data-target="#modalInstructions"></i> <button type="button" class="btn btn-primary btn-sm" @click="addSession()"><i class="fab fa-leanpub"></i> Add Session</button>          
        </div>
        <p v-for="session in filteredSessions" :key="session.id">
          <span class="badge badge-secondary">{{toLocaleDateString(session.date)}}</span> 
            <a href='#' class='btn' style='color:red' v-bind:data-id='session.id' data-toggle='modal' data-target='#modalDeleteSessionConfirm'><i class='fa fa-trash'></i></a><br />
          <textarea placeholder="Session Information..." class="sessionLog form-control" id="session-1" 
            :value="session.description" @change="parseSession($event, session);"></textarea>
        </p>
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

      <div class="col-12 col-md-4 col-lg-6">        
        <h4 class="header pt-1 pb-1">Campaign Summary</h4>        
        <div class="">
          <h5>!Issues</h5>
          <ul>
            <li v-for="thing in things.issues" :key="thing.id">            
              <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <button class="btn btn-link p-0 text-danger" type="button" @click="copyThingToClipboard(thing.thing)">{{thing.thing}}</button> <small class="mark">{{thing.description.join(",")}}</small> <span class="badge badge-dark">x{{thing.sessionids.length}}</span>
            </li>
          </ul>

          <h5>#Characters</h5>
          <ul>
            <li v-for="thing in things.characters" :key="thing.id">
              <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <button class="btn btn-link p-0 text-success" type="button" @click="copyThingToClipboard(thing.thing)">{{thing.thing}}</button> <small class="mark">{{thing.description.join(",")}}</small> <span class="badge badge-dark">x{{thing.sessionids.length}}</span>
            </li>
          </ul>

          <h5>@Faces &amp; Places</h5>
          <ul>
            <li v-for="thing in things.faceplaces" :key="thing.id">              
              <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <button class="btn btn-link p-0 text-primary" type="button" @click="copyThingToClipboard(thing.thing)">{{thing.thing}}</button> <small class="mark">{{thing.description.join(",")}}</small> <span class="badge badge-dark">x{{thing.sessionids.length}}</span>
            </li>
          </ul> 

          <h5>~Campaign Aspects</h5>
          <ul>
            <li v-for="thing in things.aspects" :key="thing.id">
              <i class="fas fa-filter" v-on:click="filterBy(thing.thing)"></i> <button class="btn btn-link p-0 text-muted" type="button" @click="copyThingToClipboard(thing.thing)">{{thing.thing}}</button> <small class="mark">{{thing.description.join(",")}}</small> <span class="badge badge-dark">x{{thing.sessionids.length}}</span>
            </li>
          </ul>        
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
              <h5>Session Logs</h5>
              <p>When entering data in your session log you can tag items to have them show up in the summary listing. Currently supported tags are:</p>
              <ul>
                <li><strong class="text-danger">#"</strong>Character Name<strong class="text-danger">"</strong></li>
                <li><strong class="text-danger">~"</strong>Campaign Aspect<strong class="text-danger">"</strong></li>
                <li><strong class="text-danger">!"</strong>Issue Description<strong class="text-danger">"</strong></li>
                <li><strong class="text-danger">@"</strong>Face or Place Name<strong class="text-danger">"</strong></li>
              </ul>
              <p>Additionally, you can add <b>extra details</b> to any tag by enclosing descriptions in square brackets and making sure they come right 
                after the tagged item (be sure to include the space between the tag and the brackets). For example:</p>                                          
              <blockquote> <strong class="text-danger">!"</strong>An impending issue<strong class="text-danger">"</strong> <strong class="text-danger">[</strong>this issue becomes active if the characters mess up<strong class="text-danger">]</strong></blockquote>

              <h5>Campaign Summary</h5>
              <ul>
                <li>Copy a tag to your clipboard by clicking on it</li>
                <li>Filter your sessions logs by clicking on the Filter icon (<i class="fas fa-filter"></i>)</li>
                <li>The badge with the number (<span class="badge badge-dark">x3</span>) is how many times this tag has been used in your session logs</li>
                <li>Hilighted items (<mark>a highlighted item</mark>) are a list of all the extra details that have been added to this tag</li>
              </ul>
          </div>
          <div class="modal-footer">            
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    
  </div>  
</template>

<script>
import { mapGetters } from 'vuex'

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
  mounted() {    
    this.parseSessionAll();
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.getCampaign(this.userId, fcs.$route.params.id);
      this.listSessions(this.userId, fcs.$route.params.id);
    }
  },
  data () {
    return {    
      campaign : {},
      //sessions : [],
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
        return this.$store.state.sessions;
      },
      set : function(value) {        
        this.$store.commit('updateSessions', value);
      }
    },
    isFiltered : function() {
      return this.$store.state.searchText;
    }
  },
  methods: {
    parseSessionAll: function() {
      if (this.sessions && this.sessions.length > 0) {
        this.sessions.sort((a, b) => (a.date < b.date) ? 1 : -1);

        for(let i = 0; i < this.sessions.length; i++) {
          let session = this.sessions[i];
          this.parseThings(session.description, session.id);
        }
      }
    },
    parseSession: function(event, session) {
      let newDescription = event.target.value;
      //find any thing that was added from this session and remove it
      this.parseThings(session.description, session.id, true);

      //then update the data
      let idx = this.sessions.indexOf(session);
      if (idx > -1) {        
        this.sessions[idx].description = newDescription;
        //this.$set(this.campaign.sessions[idx], description, newDescription);
      }          
      
      //then add in anything that is from the new text
      this.parseThings(newDescription, session.id);

      this.saveSession(session);
    },
    parseThings: function(stringToParse, sessionId, removeThing){
      var $component = this;      
      let regexString = `(?<thing>[#@!~]"(?<display>.+?)")(?:\\s?\\[(?<description>.*?)\\])?`;
      let regex = new RegExp(regexString, "g");
      let match = regex.exec(stringToParse);

      let listToUpdate = null;
      while (match != null) {
                
        if (match[0].indexOf("#") > -1) {
          listToUpdate = $component.things.characters;
        }

        if (match[0].indexOf("@") > -1) {
          listToUpdate = $component.things.faceplaces;
        }

        if (match[0].indexOf("!") > -1) {
          listToUpdate = $component.things.issues;
        }

        if (match[0].indexOf("~") > -1) {
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

          let newThing = {id: fatesheet.generateUUID(), sessionids: [sessionId], thing: thing, description: [description] || null, display: displayText } 
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

        //remove any descriptions that went with thi item
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
    addSession : function() {        
        $('.js-clear-search').trigger("click");
        let session = {id: fatesheet.generateUUID(), date: new Date().toString(), description: "", parent_id: this.campaign.id, owner_id: this.userId};
        this.sessions.unshift(session);    
    },
    deleteSession : function (event) {
      var sessionId = $(event.currentTarget).data('id');

      //reference this component so we can get/set data
      var $component = this;

      // now remove it from the db
      let docClient = fatesheet.getDBClient();
      let params = {
          TableName: fs_camp.config.campaigntable,
          Key: {
            'owner_id': $component.userId,
            'id': sessionId,
          }
      };

      console.log("Deleting session ...");
      docClient.delete(params, function (err, data) {
          if (err) {
              fatesheet.notify(err.message || JSON.stringify(err));
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          } else {              
              console.log("Deleted item:", JSON.stringify(data, null, 2));
              fatesheet.notify('Session deleted.', 'success', 2000);   
                            
              // splice the item out of the list of sessions
              let session = $component.sessions.find(x => x.id === sessionId);
              //remove the things this session added
              $component.parseThings(session.description, session.id, true);
              let sessionIdx = $component.sessions.map(function(e) { return e.id; }).indexOf(sessionId);
              $component.sessions.splice(sessionIdx, 1);

              //clear out any search filters so we get the fresh view of the data
              $('.js-clear-search').trigger("click");
          }
      });
    },
    getCampaign : async function(ownerid, id) {
      var $component = this;

      if (id === "create") {
        this.create();
        return;
      }
      
      // Create DynamoDB document client
      let docClient = fatesheet.getDBClient();

      let params = {
          TableName: fs_camp.config.campaigntable,
          Select: 'ALL_ATTRIBUTES',
          FilterExpression: '(owner_id = :owner_id) AND (id = :id)',
          ExpressionAttributeValues: {
            ':id': id,
            ':owner_id': ownerid,
          }
      }

      docClient.scan(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {

            if (data.Items.length === 0)
            {
              location.href = '/error';
            }
            else {
              console.log("Success", data.Items[0]);
              let c = data.Items[0];
              $component.$set($component, 'campaign', c);                           
            }
          }
      });
    },
    listSessions : async function(ownerid, id) {      
      var $component = this;

      // Create DynamoDB document client
      let docClient = fatesheet.getDBClient();

      let params = {
          TableName: fs_camp.config.campaigntable,
          Select: 'ALL_ATTRIBUTES',
          FilterExpression: '(owner_id = :owner_id) AND (parent_id = :parent_id)',
          ExpressionAttributeValues: {            
            ':owner_id': ownerid,
            ':parent_id': id
          }
      }

      docClient.scan(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {           
            console.log("Success", data.Items[0]);
            let s = data.Items;

            if (s && s.length > 0) {
              $component.sessions = s;
              $component.parseSessionAll();
            }        
          }
      });
    },
    create : function() {
      let c = {
        "description": "",
        "id": null,
        "owner_id": this.userId,
        "parent_id": fatesheet.emptyGuid(),
        "scale": "",
        "slug": "new-campaign",
        "title": "New Campaign",
        "date": new Date().toString(),
      };
      this.$set(this, 'campaign', c);      
    },    
    saveCampaign : function() {      
        var $component = this;
              
        // make sure we have a proper user id key
        $component.$set($component.campaign, "owner_id", this.userId);
        
        //create a new campaign Id if we don't have one
        let isNew = false;
        if (!$component.campaign.id) {
            isNew = true;
            $component.$set($component.campaign, "id", fatesheet.generateUUID());
            fatesheet.logAnalyticEvent('createdACampaign' + $component.campaign.title);
        }        
        
        //dynamodb won't let us have empty attributes
        fatesheet.removeEmptyObjects($component.campaign);

        let docClient = fatesheet.getDBClient();

        // create/update a  campaign
        // we always use the put operation because the data can change depending on your campaign
        let params = {
            TableName: fs_camp.config.campaigntable,
            Item: $component.campaign
        };

        docClient.put(params, function (err, data) {
            if (err) {
                fatesheet.notify(err.message || JSON.stringify(err));
                console.error("Unable to save campaign. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                fatesheet.notify('Campaign saved.', 'success', 2000);
                console.log("Added item:", JSON.stringify(data, null, 2));

                if (isNew) {
                  location.href = '/campaign/' + $component.campaign.id + '/' + $component.campaign.slug;
                }
            }
        });
      
    },
    saveSession : function(session) {
        var $component = this;
                            
        //dynamodb won't let us have empty attributes
        fatesheet.removeEmptyObjects($component.session);

        let docClient = fatesheet.getDBClient();

        // create/update a  campaign
        // we always use the put operation because the data can change depending on your campaign
        let params = {
            TableName: fs_camp.config.campaigntable,
            Item: session
        };

        docClient.put(params, function (err, data) {
            if (err) {
                fatesheet.notify(err.message || JSON.stringify(err));
                console.error("Unable to save session. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                fatesheet.notify('Session saved.', 'success', 2000);
                console.log("Added item:", JSON.stringify(data, null, 2));                
            }
        });
      
    },
    filterBy : function(thing) {        
      this.$store.commit('updateSearchText', thing);
      fcs.$options.filters.filterSession();      
    },
    toLocaleDateString : function(dateString) {
      return(new Date(dateString).toLocaleString());
    },  
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    },
    clearFilter : function() {
      this.$store.commit('updateSearchText', "");
      fcs.$options.filters.filterSession();
    },
    slugify : function(event) {
      let $elem = $(event.currentTarget);
      let slug = fatesheet.slugify($elem.val());
      this.$set(this.campaign, "slug", slug);
      this.saveCampaign();
    }
  }
}
</script>
