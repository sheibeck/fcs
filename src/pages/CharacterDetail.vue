<template>
  <div class="container mt-2">

    <form>
      <div class='' v-append="sheet">
      </div>

      <hr/>

      <div class='row'>
        <div class='col'>
           <button v-if="isAuthenticated" type='button' v-on:click="save" class='btn btn-success js-create-character d-print-none'>Save Character <i class='fa fa-user'></i></button>
           <a href="/character" role='button' class='btn btn-secondary d-print-none'>Close <i class='fa fa-times-circle'></i></a>
           <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>
        </div>
        <div class='col' v-if="isAuthenticated">
          <div class='row'>
            <label class='col-12 col-md-3 text-right pt-2 d-print-none' for='character_image_url'>Portrait Url:</label>
            <input class='form-control col-12 col-md-9 d-print-none' id='character_image_url' name='character_image_url'  />
          </div>
        </div>
        <div class='col' v-if="!isAuthenticated">
          <div class='row'>           
            <input type="hidden" class='form-control col-12 col-md-9 d-print-none' id='character_image_url' name='character_image_url'  />
          </div>
        </div>
      </div>

    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CharacterService from '../assets/js/characterService';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let commonSvc = null;
let dbSvc = null;
let characterSvc = null;

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
    characterSvc = new CharacterService(dbSvc);
    fs_char.init(this.$root);
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
      this.show(this.sheetname);
    }
  },
  data () {
    return {
      sheet: "",
      id: this.$route.params.id,
      sheetname: this.$route.params.sheetname,
      title: "",
      description: "",
    }
  },
  methods : {
    show : function (sheetname) {     
      var docClient = dbSvc.GetDbClient();

      var params = {
        TableName: fs_char.config.charactersheettable,
        Key: {
          'charactersheetname': sheetname
        },
      }

      docClient.get(params, (err, data) => {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Item);
            this.sheet = data.Item.charactersheetcontent;

            //fetch the character data and populate it
            this.getCharacterInfo(this.id);
        }
      });
    },
    async getCharacterInfo(id) {
      var characterData = await characterSvc.GetCharacterDetail(id);
      this.title = characterData.name + ' (Character)';
      this.description = characterData.system;

      //if the viewer isn't the character owner then don't let them save it
      // it would just copy it to their account, but for now we'll just
      // remove the option
      if (characterData.character_owner_id !== this.userId)
      {
        $('.js-create-character').remove();
      }

      //check if there is an initSheet function and run it
      if (typeof initSheet !== "undefined") {
          initSheet();
      }

      $('form').populate(characterData);

      if (typeof autocalc !== "undefined") {
          autocalc();
      }
      
      //if there is an img elemet on the sheet, populate it with the image url if specified
      setTimeout(function() {					
        //update the portrait
        if ($("img.portrait").length > 0 && $("#character_image_url").val().length > 0) {
          $("img.portrait").prop("src", $("#character_image_url").val());
        }
      }, 100);
    },
    save : function() {
      if (this.isAuthenticated) {
        /// save a character
        var data = $('form').serializeJSON();
        var characterData = JSON.parse(data);

        // make sure we have a proper user id key
        characterData.character_owner_id = this.userId;

        //create a new characterId if we don't have one
        var isNew = false;
        if (!this.id) {
            isNew = true;
            this.id = commonSvc.GenerateUUID();              
        }
        characterData.character_id = this.id;
        fs_char.config.characterId = this.id;

        //dynamodb won't let us have empty attributes
        commonSvc.RemoveEmptyObjects(characterData);

        let docClient = dbSvc.GetDbClient();

        // create/update a  character
        // we always use the put operation because the data can change depending on your character sheet
        let params = {
            TableName: fs_char.config.charactertable,
            Item: characterData
        };

        docClient.put(params, (err, data) => {
          if (err) {
              commonSvc.Notify(err.message || JSON.stringify(err));
              console.error("Unable to save item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              commonSvc.Notify('Character saved.', 'success', 2000);
              console.log("Added item:", JSON.stringify(data, null, 2));
          }
        });
    
        setTimeout(function() {					
          //update the portrait
          if ($("img.portrait").length > 0 && $("#character_image_url").val().length > 0) {
            $("img.portrait").prop("src", $("#character_image_url").val());
          }
        }, 100);
    
      }
      else {
          window.print();
      }
    }
  }
}
</script>
