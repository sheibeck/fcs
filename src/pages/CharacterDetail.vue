<template>
  <div class="container mt-2">

    <form>
      <div class='' v-append="sheet">
      </div>

      <div class="d-print-none">
        <hr/>

        <div class='row'>
          <div class='col'>
            <button v-if="isAuthenticated" type='button' v-on:click="save" class='btn btn-success js-create-character'>Save Character <i class='fa fa-user'></i></button>
            <a href="/character" role='button' class='btn btn-secondary d-print-none'>Close <i class='fa fa-times-circle'></i></a>
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
      
        <div class='row' v-if="!isAuthenticated">           
          <input type="hidden" id='image_url' name='image_url'  />
        </div>
      </div>

    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterDetail',
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
    fs_char.init(this.$root);

    this.sheetId = commonSvc.SetId("CHARACTERSHEET", this.$route.params.sheetname);
    this.characterId = commonSvc.SetId("CHARACTER", this.$route.params.id);
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ])
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
    async show() {     
      this.characterData = await dbSvc.GetObject(this.characterId);
      let response = await dbSvc.GetObject(this.characterData.related_id).then( (response) => {
        this.sheetData = response;
        this.sheet = response.content;
      }).then(() => {
        this.populateCharacterData();
      });
    },
    populateCharacterData() {    
      this.title = this.characterData.name + ' (Character)';
      this.description = this.characterData.system;

      //if the viewer isn't the character owner then don't let them save it
      // it would just copy it to their account, but for now we'll just
      // remove the option
      if (this.characterData.owner_id !== this.userId)
      {
        $('.js-create-character').remove();
      }

      //check if there is an initSheet function and run it
      if (typeof initSheet !== "undefined") {
          initSheet();
      }

      $('form').populate(this.characterData);

      if (typeof autocalc !== "undefined") {
          autocalc();
      }
      
      //if there is an img elemet on the sheet, populate it with the image url if specified
      setTimeout(function() {					
        //update the portrait
        if ($("img.portrait").length > 0 && $("#image_url").val().length > 0) {
          $("img.portrait").prop("src", $("#image_url").val());
        }
      }, 100);
    },
    async save() {
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
        characterData.object_type = "CHARACTER";
        
        //remove some legacy values
        characterData.sheetname = "";

        //create a new characterId if we don't have one
        var isNew = false;
        if (!this.characterId) {
            isNew = true;
            this.characterId = commonSvc.SetId("CHARACTER", commonSvc.GenerateUUID());
        }
        characterData.id = this.characterId;
        fs_char.config.characterId = this.characterId;

        let response = await dbSvc.SaveObject(characterData).then((response) => { 
          if (response) {
            commonSvc.Notify('Character saved.', 'success');
          }
        }).then( () => {         
          if ($("img.portrait").length > 0 && $("#image_url").val().length > 0) {
              $("img.portrait").prop("src", $("#image_url").val());
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
