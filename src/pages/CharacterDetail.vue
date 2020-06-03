<template>
  <div class="container mt-2">    
    <form>
      <charactersheet v-if="characterData" :character="characterData" :sheetid="characterData.related_id" />

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
                
        <div v-if="isAuthenticated" id="characterProperties" class="pt-2 collapse show">
          <div class='form-group'>
            <label class='' for='image_url'>Portrait Url:</label>
            <input class='form-control' id='image_url' name='image_url' @change="characterData.image_url = $event.target.value" :value="exists(characterData, 'image_url')" />
          </div>
        </div>
      
        <div class='row' v-if="!isAuthenticated">           
          <input type="hidden" id='image_url' name='image_url' @change="characterData.image_url = $event.target.value" :value="exists(characterData, 'image_url')"  />
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

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterDetail',
  components: {
    "charactersheet": CharacterSheet,    
  },
  metaInfo() {    
    return {
       title: `${this.characterData ? this.characterData.name : this.title}`,
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
    ]),
    isOwner() {      
      return this.characterData && this.characterData.owner_id == this.userId;
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
    }
  },
  methods : {   
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

        let response = await dbSvc.SaveObject(characterData).then((response) => { 
          if (response) {
            commonSvc.Notify('Character saved.', 'success');
          }
        });
      }
      else {
          window.print();
      }
    }
  }
}
</script>
