<template>
  <div class="container mt-2">

    <form>
      <div class='' v-append="sheet" @appended="appended">
      </div>
      
      <hr/>

      <div class='row'>
        <div class='col'>
          <button v-if="isAuthenticated" type='button' v-on:click="save" class='btn btn-success d-print-none'>Save Character <i class='fa fa-user'></i></button>
          <a href="/charactersheet" role='button' class='btn btn-secondary d-print-none'>Close <i class='fa fa-times-circle'></i></a>
          <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>
        </div>
        <div class='col' v-if="isAuthenticated">
            <div class='row'>
              <label class='col-12 col-md-3 text-right pt-2 d-print-none' for='image_url'>Portrait Url:</label>
              <input class='form-control col-12 col-md-9 d-print-none' id='image_url' name='image_url'  />
            </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterSheetDetail',
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
    ])
  },
  data () {
    return {
      sheet: "",
      id: this.$route.params.id,
      characterId: "",
      title: "",
      description: "",
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
      let sheetData = await dbSvc.GetObject(this.sheetId, commonSvc.GetRootOwner()).then( (data) => {         
        this.sheet = data.content;

        this.title = data.name + ' (Character Sheet)';
        this.description = data.description;
      }); 

    },
    save : function() {            
      if (this.isAuthenticated) {
        /// save a character
        var data = $('form').serializeJSON();
        var characterData = JSON.parse(data);

        if (!characterData.name) {
          commonSvc.Notify('You must specify a name');
          return;
        }

        // make sure we have a proper user id key
        characterData.character_owner_id = this.userId;

        //create a new characterId if we don't have one
        var isNew = true;
        this.characterId = commonSvc.GenerateUUID();
        characterData.character_id = this.characterId;
        fs_char.config.characterId = this.characterId;        
        
        //dynamodb won't let us have empty attributes
        commonSvc.RemoveEmptyObjects(characterData);

        var docClient = dbSvc.GetDbClient();

        // create/update a  character
        // we always use the put operation because the data can change depending on your character sheet
        var params = {
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

              location.href = '/character/' + this.id + '/' + this.characterId;
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
