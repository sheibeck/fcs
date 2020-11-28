<template>
  <div class="container mt-2">
    <div v-if="initialized && adversary">
        <div class="row">
            <input type="hidden" name="id" id="id" :value="getVal('id')" />
            <input type="hidden" name="owner_id" id="owner_id" :value="getVal('owner_id')" />
            <div class="col-sm-12 col-md-8">
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Name</label>
                    <div class="col-sm-12 col-md-10 d-flex">
                      <input class="form-control mr-auto" type="text" @change="setVal('name',  $event.target.value)" :value="getVal('name')" />
                      <div class="w-25 pt-2 ml-2 form-check">
                        <input type="checkbox" class="form-check-input" id="is_private" name="is_private" 
                          @change="setVal('is_private',  $event.target.value)" :checked="getVal('is_private')" />
                          <label class="form-check-label" for="is_private" title="Don't show this adversary in the public adversary list.">Is Private?</label>  
                      </div>
                    </div>
                </div>                
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">High Concept</label>
                    <div class="col-sm-12 col-md-10">                        
                        <input class="form-control" type="text" @change="setVal('aspects.high_concept',  $event.target.value)" :value="getVal('aspects.high_concept')" />
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Trouble</label>
                    <div class="col-sm-12 col-md-10">                        
                        <input class="form-control" type="text" @change="setVal('aspects.trouble',  $event.target.value)" :value="getVal('aspects.trouble')" />
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Other Aspects</label>
                    <div class="col-sm-12 col-md-10">                        
                        <input class="form-control" type="text" @change="setVal('aspects.other_aspects',  $event.target.value)" 
                          :value="getVal('aspects.other_aspects')" placeholder="Aspect1; Aspect2; Aspect3" />
                        <small>Use semicolon for separator</small>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Skills</label>
                    <div class="col-sm-12 col-md-10">
                        <div v-if="!adversary.skills || adversary.skills.length == 0">Click Add Skill button to add a skill.</div>
                        <div v-else v-for="(skill,index) in adversary.skills" :key="index" class="row">
                            <div class="col-md-7 d-flex">
                                <input class="form-control" type="text" v-model="skill.name"
                                  placeholder="Skills/Apprach (Fight,Athletics OR Clever)" />
                                <button type="button" class="input-group-text btn btn-danger" @click="adversary.skills.splice(index,1)">
                                  <i class="fa fa-trash"></i>
                                </button>
                            </div>
                            <div class="col-md-5">
                                <input class="form-control" type="text" v-model="skill.value"  
                                  placeholder="Value (+6 Superb OR +1, +2)" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addSkill">Add Skill <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addSkillFAE">Add FAE Approaches <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addSkillCore">Add Core Skills <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Stunts &amp; Extras</label>
                    <div class="col-sm-12 col-md-10">
                        <div v-if="!adversary.stunts || adversary.stunts.length == 0">Click Add Stunt button to add a stunt.</div>
                        <div v-else v-for="(stunt,index) in adversary.stunts" :key="index" class="row">
                            <div class="col-12 d-flex">
                                <input class="form-control" type="text" v-model="stunt.name" placeholder="Stunt/Extra/Gadget Name" />
                                <button type="button" class="input-group-text btn btn-danger" @click="adversary.stunts.splice(index,1)">
                                  <i class="fa fa-trash"></i>
                                </button>
                            </div>
                            <div class="col-12">
                                <textarea class="form-control" type="text" v-model="stunt.value" placeholder="Stunt/Extra/Gadget Description"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addStunt">Add Stunt/Extra <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Stress</label>
                    <div class="col-sm-12 col-md-10">
                        <div v-if="!adversary.stress || adversary.stress.length == 0">Click Add Stress button to add a stress track.</div>
                        <div v-else v-for="(stress,index) in adversary.stress" :key="index" class="row">
                            <div class="col-md-7 d-flex">
                                <input class="form-control" type="text" v-model="stress.name" placeholder="Stress Name (Physical, Mental, etc)" />
                                <button type="button" class="input-group-text btn btn-danger" @click="adversary.stress.splice(index,1)">
                                  <i class="fa fa-trash"></i>
                                </button>
                            </div>
                            <div class="col-md-5">
                                <input class="form-control" type="text" v-model="stress.value" placeholder="Stress Values (1,1,1 OR 1,2,3,4)" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addStress">Add Stress <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addStressFAE">Add FAE Stress <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addStressCore">Add Core Stress <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Consequences</label>
                    <div class="col-sm-12 col-md-10">
                        <div v-if="!adversary.consequences || adversary.consequences.length == 0">Click Add Consequence button to add a consequence.</div>
                        <div v-else v-for="(consequence,index) in adversary.consequences" :key="index" class="row">
                            <div class="col-12 d-flex">
                                <input class="form-control" type="text" v-model="consequence.name" placeholder="Consequence Name (Mild, Serious, Exhausted)" />
                                <button type="button" class="input-group-text btn btn-danger" @click="adversary.consequences.splice(index,1)">
                                  <i class="fa fa-trash"></i>
                                </button>
                            </div>
                            <div class="col-12">
                                <textarea class="form-control" type="text" v-model="consequence.value" placeholder="Consequence Values (Recover, Condition, etc)"></textarea>
                            </div>
                        </div>                       
                    </div>
                </div>
                <div class="form-group row">
                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-primary" v-on:click="addConsequence">Add Consequence <i class='fa fa-plus'></i></button>
                        <button type="button" class="btn btn-primary" v-on:click="addConsequenceDefault">Add Default Consequences <i class='fa fa-plus'></i></button>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="system" class="col-sm-12 col-md-2 col-form-label">System</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" v-model="adversary.system">
                            <option>Fate Core</option>
                            <option>Fate Accelerated</option>
                            <option>Fate Condensed</option>
                            <option>Fate of Cthulhu</option>                            
                            <option>Dresden Files Accelerated</option>
                            <option>Fate Freeport</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="genre" class="col-sm-12 col-md-2 col-form-label">Genre</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" v-model="adversary.genre">
                            <option>Fantasy</option>
                            <option>Modern</option>
                            <option>Sci-Fi</option>
                            <option>Horror</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group row">
                    <label for="type" class="col-sm-12 col-md-2 col-form-label">Type</label>
                    <div class="col-sm-12 col-md-10">
                        <select class="form-control" v-model="adversary.type">
                            <option>Enemy</option>
                            <option>Obstacle</option>
                            <option>Constraint</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                <div class="form-group row">
                  <label for="name" class="col-sm-12 col-md-2 col-form-label">Tags</label>
                  <div class="col-sm-12 col-md-10"> 
                    <vue-tags-input                      
                      v-model="tag"              
                      :tags="adversary.tags"
                      @tags-changed="newTags => this.adversary.tags = newTags"
                    />
                  </div>
                </div>

                <div class="form-group row">
                    <label for="name" class="col-sm-12 col-md-2 col-form-label">Portrait Url</label>
                    <div class="col-sm-12 col-md-10">                        
                        <input class="form-control" type="text" v-model="adversary.image_url" />
                    </div>
                </div>
            </div>
        </div>
        <button type="button" @click="save" class="btn btn-primary">Save Adversary <i class='fa fa-plus'></i></button>
        <button type="button" @click="cancel()" role="button" class="btn btn-secondary">Cancel <i class='fa fa-times-circle'></i></button>
        <a v-if="action == 'edit'" href='#' class='btn btn-danger' data-toggle='modal' data-target='#modalDeleteAdversaryConfirm'> Delete <i class='fa fa-trash'></i></a>
    </div>


    <!-- delete confirmation modal-->
    <div class="modal fade" id="modalDeleteAdversaryConfirm" tabindex="-1" role="dialog" aria-labelledby="deleteLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteLabel">Confirm Adversary Delete</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this adversary?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" v-on:click="deleteAdversary">Delete <i class='fa fa-trash'></i></button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import VueTagsInput from '@johmun/vue-tags-input';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'AdversaryDetail',
  metaInfo() {
    return {
       title: `${this.adversary.name ? this.adversary.name + " (Adversary)" : "Create Adversary"}`,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  components: {    
    VueTagsInput
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root); 
    this.initialized = true;   
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.init();     
    }
  },
  data () {
    return {
      initialized: false,
      adversary: {
          skills:[],
          stress:[],
          stunts:[],
          consequences:[],
        },
      title: "",
      description: "",
      action: this.$route.params.action,
      tag: "",    
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  methods: {
    init : async function() {
      this.adversaryId = commonSvc.SetId("ADVERSARY", this.$route.params.id);
            
      if (this.action == "copy")
      {
        await this.getAdversary(this.adversaryId);

        //make a copy of this adversary      
        this.adversary.id = "";        
        this.adversary.ownerId = "";
        this.adversary.is_private = true;
        this.adversary.name = `Copy of ${this.adversary.name}`;
        this.adversary.slug = commonSvc.Slugify(this.adversary.name);
      }
      else if (this.adversaryId !== "ADVERSARY|create") {
        await this.getAdversary(this.adversaryId, this.userId);
      }
    },
    getVal(graphPath, defaultValue){
      return commonSvc.getVal(this.adversary, graphPath, defaultValue);
    },
    setVal(arr, val) {         
      commonSvc.setVal(this.adversary, arr, val, Vue);
    },
    getAdversary : async function(id, ownerId) {      
      let adversary = await dbSvc.GetObject(this.adversaryId, ownerId);
      
      //convert this to new adversary format      
      if (!Array.isArray(adversary.skills)) {
        let arr = [];
        for (const [key, value] of Object.entries(adversary.skills)) {          
          arr.push({"name": key, "value": value});
        }
        adversary.skills = arr;        
      }
      
      if (!Array.isArray(adversary.stress)) {        
        let arr = [];
        for (const [key, value] of Object.entries(adversary.stress)) {          
          arr.push({"name": key, "value": value.join(",")});
        }
        adversary.stress = arr;        
      }

      if (!Array.isArray(adversary.stunts)) {
        let arr = [];
        for (const [key, value] of Object.entries(adversary.stunts)) {          
          arr.push({"name": key, "value": value});
        }
        adversary.stunts = arr;        
      }

      if (!Array.isArray(adversary.consequences)) {
        let arr = [];
        for (const [key, value] of Object.entries(adversary.consequences)) {          
          arr.push({"name": key, "value": value});
        }
        adversary.consequences = arr;        
      }

      this.adversary = adversary;            
    },   
    save : async function() {            
      if (this.adversary.name === "")
      {
        commonSvc.Notify('You must enter a name', 'error');
        return;
      }

      var isNew = false;
      if (!this.adversary.id)
      {        
        // add a uniqueid
        this.adversary.id = commonSvc.SetId("ADVERSARY", commonSvc.GenerateUUID());
        this.adversary.owner_id = this.$store.state.userId;
        isNew = true;
      }

      //name is a key field, we're going to force this to title case
      this.adversary.name = this.adversary.name.toTitleCase();
      this.adversary.slug = commonSvc.Slugify(this.adversary.name); //update the url slug
      this.adversary.object_type = "ADVERSARY";      

      // clear empty values
      commonSvc.RemoveEmptyObjects(this.adversary);

      // if this adversary already exists then warn and don't overwrite
      let existingAdversaries = await dbSvc.ListObjects("ADVERSARY", null, this.adversary.name);

      let foundAdversayWithName = existingAdversaries.filter(obj => {
        return obj.name.toLowerCase() === this.adversary.name.toLowerCase() && obj.id !== this.adversary.id;
      })

      if (foundAdversayWithName.length > 0)
      {
        commonSvc.Notify('There is already an adversary with this name. Please choose a different name', 'error');
      }
      else {        
        console.log("Saving adversary...");

        this.adversary.search_data = commonSvc.parseSearchData(this.adversary);

        let response = await dbSvc.SaveObject(this.adversary);
        if (response) {
          commonSvc.Notify('Adversary saved.', 'success', null, () => {
            if (isNew)
            {
              location.href = `/adversary/${commonSvc.GetId(this.adversary.id)}/${this.adversary.slug}/edit`;
            }
          });
        }
               
      }
    },

    deleteAdversary : async function() {
      if (!this.isOwner(this.adversary.owner_id)) {
        commonSvc.Notify('You are not the owner of this Adversary', 'error');
      }
      else {
        await dbSvc.DeleteObject( this.userId, this.adversary.id ).then( (response) => { 
          if (response) {
            this.clearAdversaryForm();
            $('#modalDeleteAdversaryConfirm').modal('hide');
            commonSvc.Notify('Adversary deleted.', 'success', null, () => {
              location.href = '/adversary'
            });
          }
        });
      }
    },

    clearAdversaryForm : function() {
      this.adversary = {};
    },

    addSkill : function() {
        this.adversary.skills.push({"name": "", "value": ""});
    },

    addSkillFAE : function() {        
        this.adversary.skills.push({"name": "Careful", "value": ""});
        this.adversary.skills.push({"name": "Clever", "value": ""});
        this.adversary.skills.push({"name": "Flashy", "value": ""});
        this.adversary.skills.push({"name": "Forceful", "value": ""});
        this.adversary.skills.push({"name": "Quick", "value": ""});
        this.adversary.skills.push({"name": "Sneaky", "value": ""});
    },

    addSkillCore : function() {
        this.adversary.skills.push({"name": "(+6) Fantastic", "value": ""});
        this.adversary.skills.push({"name": "(+5) Superb", "value": ""});
        this.adversary.skills.push({"name": "(+4) Great", "value": ""});
        this.adversary.skills.push({"name": "(+3) Good", "value": ""});
        this.adversary.skills.push({"name": "(+2) Fair", "value": ""});
        this.adversary.skills.push({"name": "(+1) Average", "value": ""});
    },

    addStunt : function() {
        this.adversary.stunts.push({"name": "", "value": ""});
    },

    addStress : function() {
        this.adversary.stress.push({"name": "", "value": ""});
    },

    addStressCore : function() {      
      this.adversary.stress.push({"name": "Physical", "value": "1,2,3"});
      this.adversary.stress.push({"name": "Mental", "value": "1,2,3"});
    },

    addStressFAE : function() {      
      this.adversary.stress.push({"name": "Stress", "value": "1,2,3"});
    },

    addConsequence : function() {
      this.adversary.consequences.push({"name": "", "value": ""});
    },

    addConsequenceDefault : function() {
        this.adversary.consequences.push({"name": "Mild", "value": "-2"});
        this.adversary.consequences.push({"name": "Moderate", "value": "-4"});
        this.adversary.consequences.push({"name": "Severe", "value": "-6"});
    },
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    },
    cancel() {      
      if (this.adversary.id) {
        //if go back to the original if we cancel and haven't saved yet
        document.location.href = `/adversary/${commonSvc.GetId(this.adversary.id)}/${this.adversary.slug}`;
      } else {
        //go back to the list if we were copying but cancelled
        document.location.href = `/adversary`;
      }
    }
  }
}
</script>
