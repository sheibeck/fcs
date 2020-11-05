<template>
  <div class="container mt-2">      
    <form>
      <charactersheet v-if="characterData" :character="characterData" :sheetid="characterData.related_id" @save-character="save"/>

      <div class="d-print-none">
        <hr/>

        <div class='row'>
          <div class='col'>
            <button v-if="isAuthenticated && isOwner" type='button' v-on:click="save" class='btn btn-success'>Save Character <i class='fa fa-user'></i></button>
            <a href="/character" role='button' class='btn btn-secondary d-print-none'>Close <i class='fa fa-times-circle'></i></a>
            <button type='button' class='btn btn-dark' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>
            <button v-if="isAuthenticated" class="btn btn-link" type="button" data-toggle="collapse" data-target="#characterProperties" aria-expanded="true" aria-controls="characterProperties">
              Character Properties <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>
                
        <div id="characterProperties" class="pt-2 collapse show">

          <div v-if="isAuthenticated"> 
            <div class="d-flex">
              <img v-if="exists(characterData, 'image_url')" :src="characterData.image_url" class="img-fluid img-thumbnail mr-1" style="max-width: 100px;" />
              <div class='form-group w-100'>
                <label class='' for='image_url'>Portrait Url:</label>
                <input class='form-control' id='image_url' name='image_url' @change="characterData.image_url = $event.target.value" :value="exists(characterData, 'image_url')" />            
              </div>
            </div>
            <div class='form-group'>
              <label class='' for='image_url'>Description:</label>
              <textarea rows=5 class='form-control' id='description' name='description' @change="characterData.description = $event.target.value" :value="exists(characterData, 'description')"  />
            </div>
            <div class="d-md-flex">
              <div class='col px-0'>
                <label class='' for='tags'>Tags:</label>
                <vue-tags-input id="tags"
                      v-if="characterData !== null"
                      v-model="tag"              
                      :tags="characterData.tags"
                      @tags-changed="newTags => updateTags(newTags)"
                    />          
              </div>
              <div class='col px-0' id="TemplateContainer" v-if="DoesSupportTemplates">
                <label class='' for='template'>Template:</label>
                <div class="d-flex">    
                  <autocomplete ref="templateAutocomplete" :search="searchTemplates"                    
                    :debounce-time="500"
                    placeholder="Find a templates"
                    aria-label="Find a Templates"                     
                    :get-result-value="getTemplateResultValue"
                    @submit="selectTemplateResult"                  
                    class="mr-1">
                    <template #result="{ result, props }">
                      <li v-bind="props">
                        <div class="p-0 m-0 h6">
                          {{result.name}}
                        </div>
                      </li>
                    </template>
                  </autocomplete>
                  <div class="pt-2">
                    <input type="checkbox" class="mr-1 input-sm" ref="templateSearchMine" /><span>Search only my templates?</span>
                  </div>
                </div>
                <div class="mt-1">
                  <button type="button" class="btn btn-success btn-sm mr-1" @click="saveTemplate">Save Template</button>
                  <button type="button" class="btn btn-primary btn-sm mr-1" v-if="template" @click="applyTemplate">Apply Template</button>
                  <button type="button" class="btn btn-danger btn-sm mr-1" v-if="IsTemplateOwner" @click="deleteTemplate">Delete Template</button>
                </div>
              </div>
            </div>
          </div>
               
          <input v-if="!isAuthenticated" type="hidden" id='image_url' name='image_url' @change="characterData.image_url = $event.target.value" :value="exists(characterData, 'image_url')"  />          
        </div>

      </div>

    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import CharacterSheet from '../components/charactersheet'
import VueTagsInput from '@johmun/vue-tags-input';
import Autocomplete from '@trevoreyre/autocomplete-vue'
import bootbox from 'bootbox';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterDetail',
  components: {
    "charactersheet": CharacterSheet,
    VueTagsInput,
    Autocomplete,
  },
  metaInfo() {    
    return {
       title: `${this.characterData ? this.characterData.name : this.pageTitle}`,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  mounted(){    
    commonSvc = new CommonService(this.$root);    
    dbSvc = new DbService(this.$root); 
     
    this.sheetId = commonSvc.SetId("CHARACTERSHEET", this.$route.params.sheetname);
    this.characterId = commonSvc.SetId("CHARACTER", this.$route.params.id);
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'pageTitle',
    ]),
    isOwner() {      
      return this.characterData && this.characterData.owner_id == this.userId;
    },
    IsTemplateOwner() {
      return this.template && this.template.owner_id == this.userId;
    },
    DoesSupportTemplates() {
      return this.characterData && this.characterData.related_id === "CHARACTERSHEET|fate-anything";
    }
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.show();
    }
  },
  data () {
    return {
      sheet: "",      
      sheetId: null,
      title: "",
      description: "",
      characterid: null,      
      characterData: null,      
      tag: "",
      template: "",        
    }
  },
  methods : {
    updateTags(newTags) {
      this.characterData.tags = newTags;     
    },   
    exists(parent, value, defaultValue) {
      return parent && parent[value] ? parent[value] : (defaultValue || "");
    },
    async show() {     
      this.characterData = await dbSvc.GetObject(this.characterId);
      if (this.characterData == null) {
        commonSvc.Notify(`Could not find character with id <b>${commonSvc.GetId(this.characterId)}</b>`, 'error', 2000);
      }     
    },   
    async save() {
      if (this.isAuthenticated && this.characterId && this.isOwner) {
        var characterData = this.characterData
        
        if (!characterData.name) {
          commonSvc.Notify('You must enter a name', 'error');
          return;
        }

        // make sure we have a proper user id key
        characterData.owner_id = this.userId;
        characterData.related_id = this.sheetId;
        characterData.slug = commonSvc.Slugify(characterData.name);
        characterData.object_type = "CHARACTER";
        characterData.search_data = commonSvc.parseSearchData(characterData);

        let response = await dbSvc.SaveObject(characterData).then((response) => { 
          if (response) {
            commonSvc.Notify('Character saved.', 'success');
          }
        });
      }      
    },

    /* template search */
    async searchTemplates(query) {
      this.template = null;
      return new Promise( async (resolve) => {                       
        let ownerId = null;
        if (this.$refs.templateSearchMine.checked) {
          ownerId = this.userId;
        }
        
        let templates = await dbSvc.ListObjects("CHARACTERSHEETTEMPLATE", ownerId, query);         
        resolve(templates);       
      })
    },
    getTemplateResultValue(result) {      
      return result ? result.name : "";
    }, 
    selectTemplateResult(result) {
      this.template = result;
    },
    async deleteTemplate() {
      bootbox.confirm("Are you sure you want delete this template?", async (result) => {        
        if (result) {
          let response = await dbSvc.DeleteObject( this.userId, this.template.id );
          if (response) {
            this.template = null;              
            commonSvc.Notify('Template deleted.', 'success');
          }
        }        
      })
    },
    applyTemplate() {
      bootbox.confirm("Are you sure you want to use this template? This will reset any custom labels.", (result) => {        
          if (result) {
            this.characterData.template_id = this.template.id;
            this.characterData.template = this.template.template;

          const removeLabels = (obj) => {
            Object.keys(obj).forEach(key => {
              if (key.indexOf("label") > -1) delete obj[key];

              if (typeof obj[key] === 'object') {
                removeLabels(obj[key])
              }
            })
          }

          removeLabels(this.characterData);
        }
      })
    },
    saveTemplate() {      
      bootbox.prompt({
        title: "Save sheet as template",
        message: "Create a new template from the current sheet. Using an existing name will overwrite that template. <br/>* Name is required.", 
        required: true,
        placeholder: this.template ? this.template.name : "",
        text: this.template.name,
        buttons: {
            confirm: {
              label: 'Yes',
              className: 'btn-success'
            },
            cancel: {
              label: 'No',
              className: 'btn-secondary'
            }
        },
        callback: async (result) => {          
          if (result) {
            let template;            
            //find templates that have the same name
            let templates = await dbSvc.ListObjects("CHARACTERSHEETTEMPLATE", null, result);
            
            if (templates.length > 0) {
              //if we found a template with the same name and this user doesn't own it
              // then bomb out because we want unique names
              let userTemplates =templates.filter(template => template.owner_id == this.userId);
              if ( userTemplates.length === 0 )
              {
                commonSvc.Notify('That template name has already been taken.', 'error');
                return;                
              }

              //otherwise, update the template              
              template = userTemplates[0];                                         
            }
            else {
              //if we didn't find any template with this name then make a new one
              template = {
                id: commonSvc.SetId("CHARACTERSHEETTEMPLATE", commonSvc.GenerateUUID()),
                owner_id : this.userId,
                name: result,                
                object_type: "CHARACTERSHEETTEMPLATE"
              }              
            }

            //convert the placeholder values to the custom label names
            let charTemplate = commonSvc.DeepCopy(this.characterData.template);
            for (const [key, value] of Object.entries(charTemplate)) {
              console.log(`${key}: ${value}`);
              if (Array.isArray(value)) {
                value.forEach( (item) => {
                  let labelVal = commonSvc.getVal(this.characterData, item.label, "");
                  item.placeholder = labelVal ? labelVal : item.placeholder;
                });
              }
            }
            template.template = charTemplate;

            let response = await dbSvc.SaveObject(template);            
            if (response) {              
              commonSvc.Notify('Template saved.', 'success');
            }            
          }
        }
      }); 
    }
  }
}
</script>

<style lang="scss">
  .autocomplete-input {    
    padding: 7px 12px 7px 48px !important;    
  }
</style>