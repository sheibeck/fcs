<template>
  <div class="container mt-2">
    <div v-if="isAuthenticated" class="row d-print-none mb-2 hide-on-detail">
      <div class="col-sm-12 col-md-3">
        <a href='/charactersheet' class='btn btn-success'>Create a Character <i class='fa fa-user'></i></a>
      </div>

      <div class="col col-md-3 fs-tools characterFilter hidden">
        <span class="badge badge-warning " style="cursor:pointer;" v-on:click="clearFilter()">x Clear Filter</span>
      </div>
    </div>
    <div class='card-columns'>
      <div v-for="(item, index) in characters" class='card'>
        <div class='card-body'>
          <h5 class='card-title character-name'>{{item.name}}</h5>
          <div class='row'>
            <p v-if="item.character_image_url" class='col-12 col-md-5 text-center'>
              <img v-bind:src="item.character_image_url" class='img-fluid' />
            </p>
            <p class='card-text col-12 col-md-7'>
              <label class='h6'>High Concept</label>: {{getCharacterValue(index, 'highconcept')}}<br>
              <label class='h6'>Trouble</label>: {{getCharacterValue(index, 'trouble')}}
            </p>
          </div>
          <hr />
          <a v-bind:href='slugify[index]' class='btn btn-primary' v-bind:data-id='item.character_id'>Play <i class='fa fa-play-circle'></i></a>
          <a href='#' class='btn btn-secondary js-share-character'>Share <i class='fa fa-share-square'></i></a>
          <a href='#' class='btn' style='color:red' v-bind:data-id='item.character_id' data-toggle='modal' data-target='#modalDeleteCharacterConfirm'><i class='fa fa-trash'></i></a>

        </div>
        <div class='card-footer text-muted'>
          <span class='small' v-html="item.description"></span> <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='item.sheetname' v-on:click="searchByTag">{{item.sheetname}}</span>
        </div>
      </div>
    </div>
    <input id='copyUrl' class='hidden' />

    <!-- delete confirmation modal-->
    <div class="modal fade" id="modalDeleteCharacterConfirm" tabindex="-1" role="dialog" aria-labelledby="deleteLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteLabel">Confirm Character Delete</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this character?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger js-delete-character" v-on:click="deleteCharacter">Delete</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CharacterList',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'My Characters',      
  },
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
    userId() {
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
    getCharacterValue: function(index, item) {
          var itemValue = eval('this.characters[' + index + ']["aspect"].' + item);
          return itemValue;
    },
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
    },

    deleteCharacter : function (event) {
      var characterId = $(event.currentTarget).data('id');

      //reference this component so we can get/set data
      var $component = this;


      var docClient = fatesheet.getDBClient();

      var params = {
          TableName: fs_char.config.charactertable,
          Key: {
            'character_owner_id': $component.userId,
            'character_id': characterId
          }
      };

      console.log("Deleting a character...");
      docClient.delete(params, function (err, data) {
          if (err) {
              fatesheet.notify(err.message || JSON.stringify(err));
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          } else {
              $('#modalDeleteCharacterConfirm').modal('hide');
              console.log("Deleted item:", JSON.stringify(data, null, 2));
              fatesheet.notify('Character deleted.', 'success', 2000);
              $component.list();
          }
      });
    },

    clearFilter : function() {
      $('#search-text').val("");
      $('#search-button').click();
      $('.characterFilter').addClass('hidden');
    },

    searchByTag : function(event) {
      var $elem = $(event.currentTarget);
      var tag = $elem.data('search-text');
      $('#search-text').val(tag);
      $('.characterFilter').removeClass('hidden');
      $('#search-button').click();
    },

  }
}
</script>
