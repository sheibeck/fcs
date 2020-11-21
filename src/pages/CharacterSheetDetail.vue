<template>
  <div class="container mt-2">

      <charactersheet :character="characterData" :sheetid="id" />        
        <div class="d-print-none">
        <hr/>

        <div class='row'>
          <div class='col'>
            <button v-if="isAuthenticated" type='button' v-on:click="save" class='btn btn-success d-print-none'>Save Character <i class='fa fa-user'></i></button>
            <a href="/charactersheet" role='button' class='btn btn-secondary d-print-none'>Close <i class='fa fa-times-circle'></i></a>
            <button type='button' class='btn btn-dark' @click='print'>Print Character <i class='fa fa-print'></i></button>
            <button v-if="isAuthenticated" class="btn btn-link" type="button" data-toggle="collapse" data-target="#characterProperties" aria-expanded="true" aria-controls="characterProperties">
              Character Properties <i class="fas fa-cog"></i>
            </button>
          </div>
        </div>

        <div v-if="isAuthenticated" id="characterProperties" class="pt-2 collapse show">        
          <div class='form-group'>
            <label class='' for='image_url'>Portrait Url:</label>
            <input class='form-control' id='image_url' name='image_url' @change="characterData.image_url = $event.target.value" :value="exists(characterData, 'image_url')" />
          </div>
          <div class='form-group'>
            <label class='' for='image_url'>Description:</label>
            <textarea rows=5 class='form-control' id='description' name='description' @change="characterData.description = $event.target.value" :value="exists(characterData, 'description')"  />
          </div>
          <vue-tags-input              
              v-model="tag"              
              :tags="characterData.tags"
              @tags-changed="newTags => updateTags(newTags)"
            />
        </div>
      </div>
          
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import CharacterSheet from '../components/charactersheet'
import VueTagsInput from '@johmun/vue-tags-input';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterSheetDetail',
  components: {
    "charactersheet": CharacterSheet, 
    VueTagsInput   
  },
  metaInfo() {
    return {
       title: this.pageTitle,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  created() {  
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
   
    this.sheetId = commonSvc.SetId("CHARACTERSHEET", this.$route.params.id);
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'pageTitle',
    ]), 
  },
  data () {
    return {
      sheet: "",
      id: this.$route.params.id,
      characterId: null,
      title: "",
      description: "",
      characterData: {        
        related_id: `CHARACTERSHEET|${this.$route.params.id}`        
      },
      tag: "",
    }
  },
  methods : {
    updateTags(newTags) {      
      this.characterData.tags = newTags;     
    },   
    exists(parent, value, defaultValue) {
      return parent && parent[value] ? parent[value] : (defaultValue || "");
    },    
    save : async function() {            
      if (this.isAuthenticated) {
        /// save a character       
        let characterData = this.characterData;

        if (!characterData.name) {
          commonSvc.Notify('You must enter a name', 'error');
          return;
        }

        // make sure we have a proper user id key
        characterData.owner_id = this.userId;
        characterData.related_id = commonSvc.SetId("CHARACTERSHEET", this.id);        
        characterData.slug = commonSvc.Slugify(characterData.name);        

        //create a new characterId if we don't have one
        this.characterId = commonSvc.SetId("CHARACTER", commonSvc.GenerateUUID());        
        characterData.id = this.characterId;
        characterData.object_type = "CHARACTER";
        characterData.search_data = commonSvc.parseSearchData(characterData);

        let response = await dbSvc.SaveObject(characterData).then((response) => {
          if (response) {
            commonSvc.Notify('Character saved.', 'success', null, () => {
                location.href = `/character/${this.id}/${commonSvc.GetId(characterData.id)}/${characterData.slug}`;
            });            
          }
        });
      }     
    },
    print() {
      if (typeof(window.print) === "function") {
        window.print();
      }      
    }
  }
}
</script>

