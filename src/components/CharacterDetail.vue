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
      </div>

    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
  created(){
    fs_char.init();
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
      //reference this component so we can get/set data
      var $component = this;

      //$('.hide-on-detail').addClass('hidden');

      // Create DynamoDB document client
      var docClient = fatesheet.getDBClient();

      var params = {
          TableName: fs_char.config.charactersheettable,
          Key: {
            'charactersheetname': sheetname
          },
      }

      docClient.get(params, function (err, data) {
          if (err) {
              console.log("Error", err);
          } else {
              console.log("Success", data.Item);
              $component.sheet = data.Item.charactersheetcontent;

              //fetch the character data and populate it
              $component.getCharacterInfo($component.id);
          }
      });
    },
    getCharacterInfo(id) {
      //reference this component so we can get/set data
      var $component = this;

      // Create DynamoDB document client
      var docClient = fatesheet.getDBClient();

      const params = {
          TableName: fs_char.config.charactertable,
          Select: 'ALL_ATTRIBUTES',
          ExpressionAttributeValues: {':character_id' : $component.id },
          FilterExpression: 'character_id = :character_id'
      }

      docClient.scan(params, onScan);

      function onScan(err, data) {
          if (err) {
              console.log("Error", err);
          } else {

            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
            else {
              var characterData = data.Items[0];
              console.log("Success", characterData);

              $component.title = characterData.name + ' (Character)';
              $component.description = characterData.system;

              //if the viewer isn't the character owner then don't let them save it
              // it would just copy it to their account, but for now we'll just
              // remove the option
              if (characterData.character_owner_id !== $component.userId)
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
                
              setTimeout(function() {					
                //update the portrait
                if ($("img.portrait").length > 0 && $("#character_image_url").val().length > 0) {
                  $("img.portrait").prop("src", $("#character_image_url").val());
                }
              }, 100);
            }
          }
      }     
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
              this.id = fatesheet.generateUUID();
              fatesheet.logAnalyticEvent('createdACharacter' + characterData.sheetname);
          }
          characterData.character_id = this.id;
          fs_char.config.characterId = this.id;

          //dynamodb won't let us have empty attributes
          fatesheet.removeEmptyObjects(characterData);

          var docClient = fatesheet.getDBClient();

          // create/update a  character
          // we always use the put operation because the data can change depending on your character sheet
          var params = {
              TableName: fs_char.config.charactertable,
              Item: characterData
          };

          docClient.put(params, function (err, data) {
              if (err) {
                  fatesheet.notify(err.message || JSON.stringify(err));
                  console.error("Unable to save item. Error JSON:", JSON.stringify(err, null, 2));
              } else {
                  fatesheet.notify('Character saved.', 'success', 2000);
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
