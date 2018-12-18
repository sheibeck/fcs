<template>
  <div class="container mt-2">
    <div v-if="isAuthenticated" class="row d-print-none mb-2 hide-on-detail">
      <div class="col-sm-12 col-md-3">
        <a href='/charactersheet' class='btn btn-success'>Create a Character <i class='fa fa-user'></i></a>
      </div>
    </div>
    <div class='card-columns'>
      <div v-for="(item, index) in characters" class='card'>
        <div class='card-body'>
          <h5 class='card-title character-name'>{{item.name}}</h5>
          <div class='row'>
            <p class='col-12 col-md-5 text-center'>
              <img v-bind:src="item.character_image_url" class='img-fluid' />
            </p>
            <p class='card-text col-12 col-md-7'>
              <label class='h6'>High Concept</label>:item.highconcept<br>
              <label class='h6'>Trouble</label>: item.trouble
            </p>
          </div>
          <hr />
          <a v-bind:href='slugify[index]' class='btn btn-primary' v-bind:data-id='item.character_id'>Play <i class='fa fa-play-circle'></i></a>
          <a href='#' class='btn btn-secondary js-share-character'>Share <i class='fa fa-share-square'></i></a>
          <a href='#' class='btn' style='color:red' v-bind:data-id='item.character_id' data-toggle='modal' data-target='#modalDeleteCharacterConfirm'><i class='fa fa-trash'></i></a>

        </div>
        <div class='card-footer text-muted'>
          <span class='small' v-html="item.description"></span> <span class='badge badge-secondary'>{{item.sheetname}}</span>
        </div>
      </div>
    </div>
    <input id='copyUrl' class='hidden' />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CharacterList',
  created(){
    fs_char.init();
  },
  computed: {
    slugify: function() {
      return this.characters.map(function(item) {
          return '/character/' + item.sheetname + '/' + item.character_id + '/' + fatesheet.slugify(item.name);
      });
    },
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  watch: {
    userId () {
      //wait for our authenticated user id
      this.list();
    }
  },
  data () {
    return {
      title: "Character List",
      characters: {}
    }
  },
  methods : {
    list : function () {
      //reference this component so we can get/set data
      var $component = this;

      // Create DynamoDB document client
      var docClient = fatesheet.getDBClient();

      var params = {
          TableName: fs_char.config.charactertable,
          Select: 'ALL_ATTRIBUTES',
          ExpressionAttributeValues: {':owner_id' : $component.userId },
          FilterExpression: 'character_owner_id = :owner_id'
      }

      docClient.scan(params, function (err, data) {
          if (err) {
              console.log("Error", err);
          } else {
              console.log("Success", data.Items);
              $component.characters = data.Items;
          }
      });
    }
  }
}
</script>
