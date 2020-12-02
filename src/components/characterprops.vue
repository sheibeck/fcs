<template>
<div>
    <div v-if="characterData && isAuthenticated && isOwner">      
        <ul class="nav nav-tabs" id="propertyTabs" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="character-tab" data-toggle="tab" href="#characterProperties" role="tab" aria-controls="character" aria-selected="true">Character Properties</a>
            </li>
            <li v-if="isCustomizable" class="nav-item" id="TabSheetProperties">
                <a class="nav-link" id="sheet-tab" data-toggle="tab" href="#sheetProperties" role="tab" aria-controls="sheet" aria-selected="false">Sheet Properties</a>
            </li>           
        </ul>

        <div class="tab-content" id="tabProperties">
          <div class="tab-pane fade show active" id="characterProperties" role="tabpanel" aria-labelledby="character-tab">           
              <div>
                  <div class="d-flex">
                      <img v-if="hasPortraitUrl" :src="characterData.image_url" class="img-fluid img-thumbnail mr-1" style="max-width: 100px;" />             
                      <div class='form-group w-100'>
                          <label class='' for='image_url'>Portrait Url:</label> <a :href="getImageSearchUrl('concept')" target="_blank">[search]</a>
                          <input class='form-control' id='image_url' name='image_url' @change="updateCharacterPortrait($event.target.value)"  :value="exists(characterData, 'image_url')" />
                          <div v-if="isCustomizable">
                              <input type="checkbox" class="mr-1 input-sm" @change="updateShowPortrait($event.target.checked)" :checked="exists(characterData.template, 'showPortrait')" /><span>Show on sheet?</span>
                          </div>
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
                  </div>           
              </div>                         
          </div>

          <div v-if="isCustomizable" class="tab-pane fade" id="sheetProperties" role="tabpanel" aria-labelledby="profile-tab">
            <div class="d-flex flex-column flex-md-row">               
              <div class="form-group col-12 col-md-6" v-if="characterData.template_id && appliedTemplate">
                <label>Applied Template:</label>
                <div>
                  {{GetTemplateName}}
                  <div class="small">
                    {{GetTemplateDescription}}
                  </div>
                  <div class="small text-muted" v-if="SheetModifiedAfterTemplate">
                    Changes have been made to this sheet or the applied template has changed.
                  </div>
                </div>
              </div>
              <div class="form-group col-12 col-md 6 d-flex flex-column">
                <label class='' for='template'>Find a Template:</label>
                <div class="d-flex">                  
                  <autocomplete ref="templateAutocomplete"
                      :search="searchTemplates"
                      :debounce-time="500"
                      placeholder="Find a template"
                      aria-label="Find a template"       
                      :get-result-value="getTemplateResultValue"
                      @submit="selectTemplateResult"
                      class="mr-1 flex-fill">
                    <template #result="{ result, props }">
                      <li v-bind="props">
                          <div class="p-0 m-0 h6">
                          {{result.name}}
                          </div>
                          <div class="small">
                          {{result.description}}
                          </div>
                      </li>                    
                    </template>                  
                  </autocomplete>                
                  <button type="button" class="btn btn-link" @click="clearTemplateSelection()"><i class="far fa-times-circle"></i></button>
                </div>
                <div>
                  <input type="checkbox" class="mr-1 input-sm" ref="templateSearchMine" /><span>Search only my templates?</span>
                </div>
                <div class="d-flex">
                    <button type="button" class="btn btn-success btn-sm mr-1" data-toggle='modal' data-target='#modalSaveTemplate'>Save Template</button>
                    <button type="button" class="btn btn-primary btn-sm mr-1" v-if="template.id" @click="applyTemplate">Apply Template</button>
                    <button type="button" class="btn btn-danger btn-sm mr-1" v-if="IsTemplateOwner" @click="deleteTemplate">Delete Template</button>
                </div>
              </div> 
            </div>              
            
            <div class='form-group flex-fill'>
                <label class='' for='sheet_logo'>Template Color:</label>
                <swatches-picker @input="updateTemplateColor" :value="getTemplateColor" />
            </div>
        
            <div class='form-group'>
                <label class='' for='sheet_logo'>Template Logo Url:</label> <a :href="getImageSearchUrl('tv show logos')" target="_blank">[search]</a>
                <input class='form-control' ref="sheet_logo" id='sheet_logo' name='sheet_logo' @change="updateTemplateLogo($event.target.value)" :value="exists(characterData.template, 'logo')" />
            </div>   

            <div class='form-group'>
                <label class='' for='sheet_logo'>Template Font:</label>
                <font-picker :api-key="'AIzaSyBPXSM04gZ5XajTtMnXr_z83loTBJ7qgDA'" :options="fontPickerOptions" :active-font="GetFont" @change="applyFont"></font-picker> 
            </div>              

            <!-- delete template confirmation modal-->
            <div class="modal fade" id="modalSaveTemplate" tabindex="-1" role="dialog" aria-labelledby="deleteLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <form class="needs-validation" novalidate id="formTemplate">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteLabel">Save Template</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Name (Max 50 characters)</label>
                                <input class="form-control" @input="limit(50)" v-model="template.name" required />
                            </div>
                            <div class="form-group">
                                <label>Description (Max 100 characters)</label>
                                <textarea maxlength="250" @input="limit(100)" class="form-control" v-model="template.description" required></textarea>
                            </div>
                            <small>
                                Save this sheet layout as a template that can be applied to other Fate Anything sheets. To update
                                one of your existing templates choose the same name. To create a new one, choose a new name.
                                You must enter a short description of your template.
                            </small>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success" @click="saveTemplate">Save</button>
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                    </form>
                </div>
            </div>           
          </div>
        </div>       
    </div>
    <div v-else style="visibility:hidden">
      <!-- need this to properly render selected fonts -->      
      <font-picker :api-key="'AIzaSyBPXSM04gZ5XajTtMnXr_z83loTBJ7qgDA'" :options="fontPickerOptions" :active-font="GetFont" @change="applyFont"></font-picker>
    </div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Compact } from 'vue-color';
import VueTagsInput from '@johmun/vue-tags-input';
import Autocomplete from '@trevoreyre/autocomplete-vue';
import bootbox from 'bootbox';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import FontPicker from 'font-picker-vue';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterProps',
   props: {
    characterData: Object,
    isCustomizable: Boolean,  
    isOwner: Boolean,  
  },
  async created() {
    await this.init();
  },
  components: {
    'swatches-picker': Compact,
    VueTagsInput,
    Autocomplete,
    'font-picker': FontPicker
  },
  data() {
      return {
        tag: "",
        template: {
            name: "",
            description: "",
        },
        appliedTemplate: null,
        fontPickerOptions: {
          name: "main",  
          variants: ['regular', '700'],
          //categories: ['sans-serif', 'serif', 'display'],
          limit: 200,          
        }
      }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
    async GetAppliedTemplate() {      
      if (this.characterData.template_id && !this.appliedTemplate) {       
        let template = await dbSvc.GetObject(this.characterData.template_id);
        if (template) {
          this.appliedTemplate = template;           
        }
      }
    },
    GetFont() {
      if (this.characterData.template && this.characterData.template.fontFamily) {
        return this.characterData.template.fontFamily;
      }
      else {
        return "Open Sans";
      }      
    },
    SheetModifiedAfterTemplate() {
      return JSON.stringify(this.appliedTemplate.template) !== JSON.stringify(this.characterData.template);
    },
    GetHighConcept() {
        let concept = "character portraits";

        if (this.characterData.aspects)
        {
            //attempt to find the high concept
            let desc = this.characterData.aspects ? (this.characterData.aspects.highconcept ? this.characterData.aspects.highconcept : "") : "";
            if (desc === "" && Object.keys(this.characterData.aspects).length > 0) {
                desc = this.characterData.aspects[Object.keys(this.characterData.aspects).sort()[0]];
            }
            if (desc) {
                concept = desc;
            }
        }

        return `${concept} portrait`;
    },
    IsTemplateOwner() {
      return this.template && this.template.owner_id == this.userId;
    }, 
    GetTemplateName() {      
      return this.appliedTemplate ? this.appliedTemplate.name : 'None';
    },
    GetTemplateDescription() {
      return this.characterData.template ? this.characterData.template.description : '';
    },
    getTemplateColor() {
      if (this.characterData.template) {        
        return this.characterData.template.color ? this.characterData.template.color : "black";
      }
    },    
    hasPortraitUrl() {
      return this.exists(this.characterData, 'image_url');
    }
  },
  methods: {
    async init() {    
        commonSvc = new CommonService(this.$root);
        dbSvc = new DbService(this.$root); 

        await this.GetAppliedTemplate;

        $('#modalSaveTemplate').on('hidden.bs.modal', function (e) {
            let form = document.getElementById('formTemplate');
            form.classList.remove('was-validated');
        })
    },
    limit(maxLength)
    {       
      if (this.template.description.length >= maxLength) {
        this.template.description = this.template.description.substring(0,maxLength);
      }
    },
    exists(parent, value, defaultValue) {
      return parent && parent[value] ? parent[value] : (defaultValue || "");
    },
    updateTags(newTags) {
      this.characterData.tags = newTags;     
    }, 
     /* template search */
    async searchTemplates(query) {     
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
      if (result) {
        this.template = result;
      }     
      return true;
    },
    async deleteTemplate() {
      bootbox.confirm("Are you sure you want delete this template?", async (result) => {        
        if (result) {
          let response = await dbSvc.DeleteObject( this.userId, this.template.id );
          if (response) {
            this.template = {
              name: "",
              description: "",
            };              
            commonSvc.Notify('Template deleted.', 'success');
          }
        }        
      })
    },
    applyTemplate() {
      bootbox.confirm("Are you sure you want to use this template? This will reset any custom labels.", async (result) => {        
        if (result) {               
          //remove any existing labels so the new template labels/placeholder take effect
          const removeLabels = (obj) => {
            if (!obj) return;

            Object.keys(obj).forEach(key => {
              if (key.indexOf("label") > -1) delete obj[key];

              if (typeof obj[key] === 'object') {
                removeLabels(obj[key])
              }
            })
          }
          removeLabels(this.characterData);

          //assign the new template to this character
          this.$set(this.characterData, "template_id", this.template.id);
          this.$set(this.characterData, "template", this.template.template);
          this.appliedTemplate = this.template;
        }
      })
    },
    async saveTemplate() {
      let isValid = false;

      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      let form = document.getElementById('formTemplate');
      isValid = form.checkValidity();
      form.classList.add('was-validated');      

      if (isValid) {
        let template;
        //find templates that have the same name
        let templates = await dbSvc.ListObjects("CHARACTERSHEETTEMPLATE", null, this.template.name);
        
        if (templates.length > 0) {
          //if we found a template with the same name and this user doesn't own it
          // then bomb out because we want unique names
          let userTemplates=templates.filter(template => template.owner_id == this.userId);
          if ( userTemplates.length === 0 )
          {
            commonSvc.Notify('This name has already been used. Please choose a different name.', 'error');
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
            name: this.template.name,                
            description: this.template.description,
            object_type: "CHARACTERSHEETTEMPLATE"
          }              
        }

        //convert the placeholder values to the custom label names
        let charTemplate = commonSvc.DeepCopy(this.characterData.template);

        let parseTemplate = (thingToParse) => {
          if (typeof(thingToParse) == "object")
          {
            for (const [key, value] of Object.entries(thingToParse)) {
              if (Array.isArray(value)) {
                value.forEach( (item) => {
                  let labelVal = commonSvc.getVal(this.characterData, item.label, "");
                  item.placeholder = labelVal ? labelVal : item.placeholder;
                  if (item.value) {
                    let valueVal = commonSvc.getVal(this.characterData, item.value, "");
                    item.valueplaceholder = valueVal ? valueVal : item.valueplaceholder;
                  }

                  parseTemplate(item);
                });              
              }
            }
          }
        }
        parseTemplate(charTemplate);

        //we are copying the template from the existing character 
        //changes so we need to pickup the updated name/description
        charTemplate.name = this.template.name;
        charTemplate.description = this.template.description;
        template.template = charTemplate;
       
        let response = await dbSvc.SaveObject(template);
        if (response) {
          commonSvc.Notify('Template saved.', 'success');
          $('#modalSaveTemplate').modal('hide');

          //apply the template to this character
          this.$set(this.characterData, "template_id", template.id);
          this.$set(this.characterData, "template", charTemplate);
          this.appliedTemplate = template;
          this.$emit('save-character');          
        }            
      }
    },
    updateTemplateColor(color) {      
      this.$set(this.characterData.template, "color", color.hex);
    }, 
    updateTemplateLogo(logo) {
      this.$set(this.characterData.template, "logo", logo);
    },   
    updateCharacterPortrait(portrait) {      
      this.$set(this.characterData, "image_url", portrait);
    },
    updateShowPortrait(show) {
      this.$set(this.characterData.template, "showPortrait", show);
    },
    getImageSearchUrl(query) {       
        if (query == "concept") {
            query = this.GetHighConcept;
        }
        return commonSvc.GetImageSearchUrl(query);
    },
    applyFont(font) {      
      this.$set(this.characterData.template, "fontFamily", font.family);
    },
    clearTemplateSelection() {
      this.$refs.templateAutocomplete.value = '';
      this.template = {
            name: "",
            description: "",
        }
    }
  }
}

</script>