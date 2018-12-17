<template>
  <div class="container mt-2">
      <div class='card-columns'>
        <div v-for='sheet in sheets' class='card'>
          <img class='card-img-top img-thumbnail img-fluid' v-bind:src="'sheets/'+sheet.charactersheetname+'/logo.png'" v-bind:alt="sheet.charactersheetname + ' Logo'" />
          <div class='card-body'>
            <h5 class='card-title charactersheet-name'>{{sheet.charactersheetdisplayname}}</h5>
            <a v-bind:href="'charactersheet/'+sheet.charactersheetname" class='btn btn-success' v-bind:data-id='sheet.charactersheetid' role="button">Create Character <i class='fa fa-user'></i></a>
          </div>
          <div class='card-footer text-muted small' v-html="sheet.charactersheetdescription">

          </div>
         </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterSheetList',
  created(){
    fs_char.init();
    this.list();
  },
  data () {
    return {
      title: "Character Sheets",
      sheets: {}
    }
  },
  methods : {
        list : function(){
          //reference this component so we can get/set data
          var $component = this;

          // Create DynamoDB document client
          var docClient = fatesheet.getDBClient();

          var params = {
              TableName: fs_char.config.charactersheettable,
              Select: 'ALL_ATTRIBUTES'
          }

          docClient.scan(params, function (err, data) {
              if (err) {
                  console.log("Error", err);

                  return {};

              } else {
                  console.log("Success", data.Items);
                  $component.sheets = data.Items;
              }
          });
        }
    }
}
</script>
