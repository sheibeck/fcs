<template>
  <div class="container mt-2">

    <form>
      <div class='' v-append="sheet">
      </div>
    </form>

    <hr/>

    <div class='row'>
      <div class='col'>
         <button v-if="isAuthenticated" type='button' v-on:click="save" class='btn btn-success d-print-none'>Save Character <i class='fa fa-user'></i></button>
         <a href="/charactersheet" role='button' class='btn btn-secondary d-print-none'>Close <i class='fa fa-times-circle'></i></a>
         <button type='button' class='btn btn-default d-print-none' onclick='window.print();'>Print Character <i class='fa fa-print'></i></button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CharacterSheetDetail',
  created(){
    fs_char.init();
    this.show();
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
    }
  },
  methods : {
       show : function (id) {
          //reference this component so we can get/set data
          var $component = this;

          //$('.hide-on-detail').addClass('hidden');

          // Create DynamoDB document client
          var docClient = fatesheet.getDBClient();

          var params = {
              TableName: fs_char.config.charactersheettable,
              Key: {
               'charactersheetname': $component.id
              },
          }

          docClient.get(params, function (err, data) {
              if (err) {
                  console.log("Error", err);
              } else {
                  console.log("Success", data.Item);
                  $component.sheet = data.Item.charactersheetcontent;
              }
          });
      },
      save : function() {
      debugger;
        var $component = this;
        if (this.isAuthenticated) {
            /// save a character
            var data = $('form').serializeJSON();
            var characterData = JSON.parse(data);

            // make sure we have a proper user id key
            characterData.character_owner_id = $component.userId;

            //create a new characterId if we don't have one
            var isNew = true;
            this.characterId = fatesheet.generateUUID();
            characterData.character_id = this.characterId;
            fs_char.config.characterId = this.characterId;
            fatesheet.logAnalyticEvent('createdACharacter' + characterData.sheetname);

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

                    location.href = '/character/' + $component.id + '/' + $component.characterId;
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
