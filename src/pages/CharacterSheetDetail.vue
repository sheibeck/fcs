<template>
  <div class="container mt-2">

    <form>
      <charactersheet :character="characterData" :sheetid="id" />
      
      <hr/>

      <div class='row'>
        <div class='col'>
          <button v-if="isAuthenticated" type='button' v-on:click="save" class='btn btn-success d-print-none'>Save Character <i class='fa fa-user'></i></button>
          <a href="/charactersheet" role='button' class='btn btn-secondary d-print-none'>Close <i class='fa fa-times-circle'></i></a>
          <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>
          <button v-if="isAuthenticated" class="btn btn-link" type="button" data-toggle="collapse" data-target="#characterProperties" aria-expanded="true" aria-controls="characterProperties">
              Character Properties
          </button>
        </div>
      </div>

      <div v-if="isAuthenticated" id="characterProperties" class="pt-2 collapse show">        
        <div class='form-group'>
          <label class='' for='image_url'>Portrait Url:</label>
          <input class='form-control' id='image_url' name='image_url'  />
        </div>
      </div>
      
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import CharacterSheet from '../components/charactersheet'

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterSheetDetail',
  components: {
    "charactersheet": CharacterSheet,    
  },
  metaInfo() {
    return {
       title: this.title,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
   
    this.sheetId = commonSvc.SetId("CHARACTERSHEET", this.$route.params.id);
  },
  watch: {
    userId() {
      this.show();
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]), 
  },
  data () {
    return {
      sheet: "",
      id: this.$route.params.id,
      characterId: "",
      title: "",
      description: "",
      characterData: {},
    }
  },
  methods : {
    appended: function() {
      //check if there is an initSheet function and run it
      setTimeout(function() {
        if (typeof initSheet !== "undefined") {
            initSheet();
        }
      }, 1000);
    },
    async show() {      
      await dbSvc.GetObject(this.sheetId, commonSvc.GetRootOwner()).then( (data) => { 
        this.sheetData = data;        
        this.sheet = data.content;

        this.title = data.name + ' (Character Sheet)';
        this.description = data.description;
      }); 

    },
    save : async function() {            
      if (this.isAuthenticated) {
        /// save a character
        var data = $('form').serializeJSON();
        var characterData = JSON.parse(data);

        if (!characterData.name) {
          commonSvc.Notify('You must enter a name', 'error');
          return;
        }

        // make sure we have a proper user id key        
        characterData.owner_id = this.userId;
        characterData.related_id = this.sheetData.id;
        characterData.system = this.sheetData.system;
        characterData.slug = commonSvc.Slugify(characterData.name);        

        //remove some legacy values
        characterData.sheetname = "";

        //create a new characterId if we don't have one
        var isNew = true;                
        this.characterId = commonSvc.SetId("CHARACTER", commonSvc.GenerateUUID());        
        characterData.id = this.characterId;
        characterData.object_type = "CHARACTER";

        let response = await dbSvc.SaveObject(characterData).then((response) => {
          if (response) {
            commonSvc.Notify('Character saved.', 'success', null, () => {
                location.href = `/character/${this.sheetData.slug}/${commonSvc.GetId(characterData.id)}/${characterData.slug}`;
            });            
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
