<style type="text/css">  
    ul li.disabled {
        cursor: default;
        text-decoration: line-through;
    }
</style>

<template>
  <div class="container mt-2">
    <input type="hidden" name="id" id="id" v-model="campaign.id" />
    <input type="hidden" name="owner_id" v-model="campaign.owner_id" id="owner_id" />    
    <div class="form-group">
      <label for="name">Name</label>        
      <input class="form-control" type="text" id="name" name="name" aria-describedby="titleHelp" placeholder="Campaign name" v-model="campaign.title" @change="slugify">
      <!--<small id="titleHelp" class="form-text text-muted">https://fatecharactersheet.com/campaign/{{campaign.id}}/{{campaign.slug}}</small> -->
    </div>    
    <div id="metadata">
      <div class="form-group">
        <label for="scale">Scale</label>
        <select class="form-control" id="scale" name="scale" v-model="campaign.scale" @change="save">
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
          <textarea class="form-control" type="text" value="" id="description" name="description" placeholder="Campaign description..." v-model="campaign.description" @change="save"></textarea>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-8 col-lg-6">        
        <div>
          <span class="h4">Session Log</span> <button type="button" class="btn btn-primary btn-sm" @click="addSession()"><i class="fab fa-leanpub"></i> Add Session</button>          
        </div>
        <p v-for="session of campaign.sessions" :key="session.id">
          <span class="badge badge-secondary">{{toLocaleDateString(session.date)}}</span><br />
          <textarea placeholder="Session Information..." class="sessionLog form-control" id="session-1" 
            :value="session.description" @change="parseSession($event, session); save()"></textarea>
        </p>
      </div>

      <div class="col-12 col-md-4 col-lg-6">
        <div data-toggle="modal" data-target="#modalInstructions">
          <span class="h4">Summary</span> <i class="fas fa-question-circle"></i>
        </div>
        <div class="">
          <h5>Issues</h5>
          <ul>
            <li v-for="thing in things.issues" :key="thing.id">            
              {{thing.display}}
            </li>
          </ul>

          <h5>Characters</h5>
          <ul>
            <li v-for="thing in things.characters" :key="thing.id">
              {{thing.display}} <span class="badge badge-dark">x{{thing.sessionids.length}}</span>
            </li>
          </ul>

          <h5>Faces &amp; Places</h5>
          <ul>
            <li v-for="thing in things.faceplaces" :key="thing.id">
              {{thing.display}} <span class="badge badge-dark">x{{thing.sessionids.length}}</span>
            </li>
          </ul> 

          <h5>Aspects</h5>
          <ul>
            <li v-for="thing in things.aspects" :key="thing.id">
                {{thing.display}} <span class="badge badge-dark">x{{thing.sessionids.length}}</span>
            </li>
          </ul>        
        </div>
      </div>
    </div>

    <!-- instruction modal -->     
    <div class="modal fade" id="modalInstructions" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Instructions</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
              <p>When entering data in your session log you can tag items to have them show up in the summary listing. Currently supported tags are:</p>
              <ul>
                <li><strong class="text-danger">#"</strong>Character Name<strong class="text-danger">"</strong></li>
                <li><strong class="text-danger">~"</strong>Campaign Aspect<strong class="text-danger">"</strong></li>
                <li><strong class="text-danger">!"</strong>Issue Description<strong class="text-danger">"</strong></li>
                <li><strong class="text-danger">@"</strong>Face or Place Name<strong class="text-danger">"</strong></li>
              </ul>
              <p>Additionally, you can add extra details to any tag by enclosing descriptions in square brackets and making sure they come right 
                after the tagged item (be sure to include the space between the tag and the brackets). For example:</p>                                          
              <blockquote> <strong class="text-danger">!"</strong>An impending issue<strong class="text-danger">"</strong> <strong class="text-danger">[</strong>this issue becomes active if the characters mess up<strong class="text-danger">]</strong></blockquote>
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
    }
  },
  data () {
    return {    
      campaign : {},
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
    ]),
  },
  methods: {
    parseSessionAll: function() {
      if (this.campaign.sessions && this.campaign.sessions.length > 0) {
        this.campaign.sessions.sort((a, b) => (a.date < b.date) ? 1 : -1);

        for(var i = 0; i < this.campaign.sessions.length; i++) {
          var session = this.campaign.sessions[i];
          this.parseThings(session.description, session.id);
        }
      }
    },
    parseSession: function(event, session) {
      let newDescription = event.target.value;
      //find any thing that was added from this session and remove it
      this.parseThings(session.description, session.id, true);

      //then update the data
      let idx = this.campaign.sessions.indexOf(session);
      if (idx > -1) {        
        this.campaign.sessions[idx].description = newDescription;
        //this.$set(this.campaign.sessions[idx], description, newDescription);
      }          
      
      //then add in anything that is from the new text
      this.parseThings(newDescription, session.id);      
    },
    parseThings: function(stringToParse, sessionId, removeThing){
      let $component = this;      
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
        for(var i = 0; i < list.length; i++) {
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
        for(var i = 0; i < list.length; i++) {
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
        if (description && list[thingIdx].description) {
          let descIdx = list[thingIdx].description.indexOf(description);
          if (descIdx > -1) {
            list[thingIdx].description.splice(descIdx, 1);
            //update the display
            list[thingIdx].display = `${display} ${description.length > 0 ? "[" + list[thingIdx].description.join(", ") + "]" : ""}`;
          }
        }
      }
    },    
    addSession : function() {
        let sid = fatesheet.generateUUID();
        let session = {id: sid, date: new Date().toString(), description: ""};
        this.campaign.sessions.unshift(session);    
    },
    getCampaign : function(ownerid, id) {      
      var $component = this;

      if (id === "create") {
        this.create();
        return;
      }
      
      // Create DynamoDB document client
      var docClient = fatesheet.getDBClient();

      var params = {
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

              if (!c.sessions) {
                c.sessions = [];          
              }

              $component.$set($component, 'campaign', c);
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
        "scale": "",
        "slug": "new-campaign",
        "title": "New Campaign"
      };
      this.$set(this, 'campaign', c);
      this.save();
    },
    save : function() {      
        let $component = this;
              
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

        var docClient = fatesheet.getDBClient();

        // create/update a  campaign
        // we always use the put operation because the data can change depending on your campaign
        var params = {
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

                location.href = '/campaign/' + $component.campaign.id + '/' + $component.campaign.slug;
            }
        });
      
    },
    toLocaleDateString : function(dateString) {
      return(new Date(dateString).toLocaleString());
    },  
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    },
    slugify : function(event) {
      var $elem = $(event.currentTarget);
      var slug = fatesheet.slugify($elem.val());
      this.$set(this.campaign, "slug", slug);
      this.save();
    }
  }
}
</script>
