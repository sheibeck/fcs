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
    
    <div class="form-group row">
        <label for="name" class="col-sm-12 col-md-2 col-form-label">Name</label>
        <div class="col-sm-12 col-md-10">
            <input class="form-control" type="text" value="" id="name" name="name" v-model="campaign.name" v-on:change="slugifyName">
        </div>
    </div>
    <div class="form-group row">
        <label for="name" class="col-sm-12 col-md-2 col-form-label">Slug</label>
        <div class="col-sm-12 col-md-10">
            <input class="form-control" type="text" value="" id="slug" name="slug" v-model="campaign.slug" readonly>
        </div>
    </div>

    <div class="row">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="small">
          <strong class="text-danger">#</strong>Character, <strong class="text-danger">@</strong>FaceOrPlace,
          <strong class="text-danger">~</strong>Aspect, <strong class="text-danger">^</strong>Resolve an Issue or Aspect
          <strong class="text-danger">!</strong>IssueDescription
          <br /> !issuename <strong class="text-danger">[</strong>add extra info after any tag<strong class="text-danger">]</strong>
        </div>
        <h2>Session Log</h2>
        <div>
          <button type="button" @click="addSession()">Add Session</button>
        </div>
        <p v-for="session of campaign.sessions" :key="session.id">
          <label>{{session.date}}</label><br />
          <textarea placeholder="Session Information..." class="sessionLog form-control" id="session-1" :value="session.description" @change="parseSession($event, session)"></textarea>
        </p>
      </div>
      <div class="col-12 col-md-4 col-lg-6">
        <h2>Issues</h2>
        <ul>
          <li v-for="thing in things.issues" :key="thing.id">            
            {{thing.display}}
          </li>
        </ul>

        <h2>Characters</h2>
        <ul>
           <li v-for="thing in things.characters" :key="thing.id">{{thing.display}}</li>
        </ul>

        <h2>Faces &amp; Places</h2>
        <ul>
           <li v-for="thing in things.faceplaces" :key="thing.id">{{thing.display}}</li>
        </ul> 

        <h2>Aspects</h2>
        <ul>
           <li v-for="thing in things.aspects" :key="thing.id">
              {{thing.display}}
           </li>
        </ul>        
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
      //this.listSessions(this.userId, fcs.$route.params.id);           
    }
  },
  data () {
    return {
      campaign: { 
        sessions: [
          {id: fatesheet.generateUUID(), date:new Date("2/19/2020 10:00:00").toString(), description:`#"Fell Stone" was running from @"The Kingdom of Carmon" because @"The Tyrant King" [Who rules with an iron fist] was !"Trying to take over the world by military force" it is a ~"A cruel, cruel world"`},
          {id: fatesheet.generateUUID(), date:new Date("2/19/2020 9:00:00").toString(), description:`#"Fell Stone" [Has a bad leg injury] from jumping across @"The Big River"`} 
        ]
      },
      tags: ["#","@","!","~"],
      things: {
        characters: [],
        faceplaces: [],
        issues: [],
        aspects: [],
        resolved: [],
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
      this.campaign.sessions.sort((a, b) => (a.date < b.date) ? 1 : -1);

      for(var i = 0; i < this.campaign.sessions.length; i++) {
        var session = this.campaign.sessions[i];
        this.parseThings(session.description, session.id);
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
      //this.updateResolvedItems();
    },    
    /*
    updateResolvedItems : function(unresolveThing) {
      //TODO: implement this a better way
      return;
      
      let $component = this;
      let resolvableTags = ["!", "~"];
      
      resolvableTags.forEach(function(tag) {
        if (!unresolveThing) {
          //now look for resolved items by iterating over the resolved array and then marking
          // items in the other thing bins with True when an item in them has been resolved          
          $component.things.resolved.forEach(function(res) {        
            let listToSearch = tag === "!" ? $component.things.issues : $component.things.aspects;
            let thingToFind = res.thing.replace(/\^/g, tag);
            let thingIdx =  $component.findThing(listToSearch, thingToFind);
            if (thingIdx > -1) {
              listToSearch[thingIdx].resolved = true;
            }        
          });
          
        } else {
          //we have a specific item that we are unresolving
          let listToSearch = tag === "!" ? $component.things.issues : $component.things.aspects;
          let thingToFind = new String(unresolveThing).replace(/\^/g, tag);          
          let thingIdx = $component.findThing(listToSearch, thingToFind);
          if (thingIdx > -1) {
              listToSearch[thingIdx].resolved = false;
          } 
        }       
      });           
    },*/
    findThing: function(list, value) { 
      //find a thing in the things lists     
      if (list) {
        for(var i = 0; i < list.length; i += 1) {
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
        for(var i = 0; i < list.length; i += 1) {
            if(list[i]["thing"] === value && list[i].sessionids.indexOf(sessionId) > -1) {
                return i;
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

          let newThing = {id: fatesheet.generateUUID(), sessionids: [sessionId], thing: thing, description: description || null, display: displayText } 
          list.push(newThing);
        }
        
        //if the thing exists but not for this session, associate it with this session
        if(thingIdx > -1) {
          if (thingInSessionIdx === -1) {
            list[thingIdx].sessionids.push(sessionId);
          }
          if (description && list[thingIdx].description && list[thingIdx].description.indexOf(description) === -1) {
            list[thingIdx].description.push(description);
            list[thingIdx].display = `${display} ${description.length > 0 ? "[" + list[thingIdx].description.join(", ") + "]" : ""}`;
          }
        }
      } 
      
      //if we are removing, remove the association of this thing to this session
      if (removeThing && thingIdx > -1) {
        if (list[thingIdx].sessionids.length > 1) {          
          list[thingIdx].sessionids.splice(thingInSessionIdx, 1);
        }
        else {
          //if there are no more sessions associated with this thing, then remove it entirely
          list.splice(thingIdx, 1);
        
          //if this item was removed AND it was a resolved item, then go mark the related items as not resolved anymore
          //if (tag === "\\^") {
          //  this.updateResolvedItems(thing);
          //}
        }        
      }
    },    
    addSession : function() {
        let sid = fatesheet.generateUUID();
        let session = {id: sid, date: new Date().toString(), description: ""};
        this.campaign.sessions.unshift(session);    
    },
    listSessions : function(ownerid, id) {      
      //we only edit if we have a valid slug for an id
      if (!slug) return;

      var $component = this;
      
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
              //location.href = '/error';
            }
            else {
              console.log("Success", data.Items[0]);
              $component.campaign = data.Items[0];
              
              //BEGIN DEV
               $component.campaign.sessions = [
                  {session:"2/18/20", description:"#Fell_Stone was running from @The_Kingdom_Of_Carmon where !The_King[was a tyrant and trying to take over the world]"},
                  {session:"2/17/20", description:"#Fell_Stone jumped across @River"} 
                ];

              $component.parseSessionAll();
              //END DEV
            }
          }
      });
    },
    upsert : function() {
        var $component = this;

        var data = $component.campaign;

        var isNew = false;
        if (!result.id)
        {
          // add a uniqueid
          result['id'] = fatesheet.generateUUID();
          result['owner_id'] = fatesheet.config.userId;
          isNew = true;
        }        

        if (isNew)
        {
          //create the campaign
          $component.insert(result);
        }
        else {
          $component.update(result);
        }
    },

    insert: function(campaignData) {

        var docClient = fatesheet.getDBClient();

        var params = {
            TableName: fs_camp.config.campaigntable,
            Key: {
             'owner_id': campaignData.owner_id,
             'id': campaignData.id
            },
        }

        // if this campaign already exists then warn and don't overwrite
        docClient.get(params, function(err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              if (data.Item)
              {
                fatesheet.notify('You already have an campaign with this name.', 'info', '2000');
              }
              else {
                  // create a new creature
                  var params = {
                      TableName: fs_camp.config.campaigntable,
                      Item: campaignData
                  };

                  console.log("Adding a new campaign...");
                  docClient.put(params, function (err, data) {
                      if (err) {
                          fatesheet.notify(err.message || JSON.stringify(err));
                          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                      } else {
                          console.log("Added item:", JSON.stringify(data, null, 2));
                          fatesheet.notify('Campaign added.', 'success', 2000, function() {
                            location.href = '/campaign/' + campaignData.slug;
                          } );

                      }
                  });
              }
            }
        });
    },

    update : function(data) {
        var docClient = fatesheet.getDBClient();

        var params = {
            TableName: fs_camp.config.campaigntable,
            Key: {
             'owner_id': data.owner_id,
             'name': $('#name').val().toTitleCase() // it's disabled when we update so they don't try to change it.
            },
            UpdateExpression: "set campaign_issues = :i, campaign_slug =:slg, campaign_faces=:f, campaign_places=:p, campaign_scale=:s",
            ExpressionAttributeValues:{
                ":i":data.campaign_issues,
                ":slg": data.campaign_slug,
                ":f":data.campaign_faces,
                ":p":data.campaign_places,
                ":s": data.campaign_scale                
            },
            ReturnValues:"UPDATED_NEW"
        };

        console.log("Updating campaign...");
        docClient.update(params, function (err, data) {
            if (err) {
                fatesheet.notify(err.message || JSON.stringify(err));
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                fatesheet.notify('Campaign updated.', 'success', 2000);
            }
        });
    },
  
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    },
    slugifyName : function(event) {
      var $elem = $(event.currentTarget);
      var slug = fatesheet.slugify($elem.val());
      $('#campaign_slug').val(slug);
    }
  }
}
</script>
