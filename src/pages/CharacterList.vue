<template>
  <div class="container mt-2">
    <div v-if="isAuthenticated" class="d-print-none mb-2 hide-on-detail d-md-flex">
      <a href='/charactersheet' class='btn btn-success mr-auto mb-1 mb-md-0'>Create a Character <i class='fa fa-user'></i></a>
      <search class=""></search>
    </div>
    <div class='card-columns'>
      <div v-for="(item, index) in characters" v-bind:key="item.id" class='card'>
        <div class='card-body'>
          <h5 class='card-title character-name'>{{item.name}}</h5>
          <div class='row'>
            <p v-if="item.character_image_url" class='col-12 col-md-5 text-center'>
              <img v-bind:src="item.character_image_url" class='img-fluid' />
            </p>
            <p class='card-text col-12 col-md-7'>
              <label class='h6'>High Concept</label>: {{item.aspect.highconcept}}<br>
              <label class='h6'>Trouble</label>: {{item.aspect.trouble}}
            </p>
          </div>
          <hr />
          <div class="d-flex">
            <a v-bind:href='slugify[index]' class='btn btn-primary' v-bind:data-id='item.character_id'>Play <i class='fa fa-play-circle'></i></a>
            <a href='#' class='btn btn-secondary js-share-character ml-1 mr-auto'>Share <i class='fa fa-share-square'></i></a>
            <a href='#' class='btn' style='color:red' v-bind:data-id='item.character_id' data-toggle='modal' data-target='#modalDeleteCharacterConfirm'><i class='fa fa-trash'></i></a>
          </div>
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
import { mapGetters } from 'vuex';
import Search from '../components/search';
import CharacterService from '../assets/js/characterService';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let commonSvc = null;
let dbSvc = null;
let characterSvc = null;

export default {
  name: 'CharacterList',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'My Characters',
  },
  components: {
    search: Search,
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
    characterSvc = new CharacterService(dbSvc);
    fs_char.init(this.$root);
  },
  computed: {
    slugify: function() {
      return this.characters.map(function(item) {
          return '/character/' + item.sheetname + '/' + item.character_id + '/' + commonSvc.Slugify(item.name);
      });
    },
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'searchText'
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
      characters: {},
    }
  },
  methods : {
    getCharacterValue: function(index, item) {
      var itemValue = eval('this.characters[' + index + ']["aspect"].' + item);
      return itemValue;
    },

    list : function () {            
      let listitems = characterSvc.listByOwnerId(this.$store.state.userId).then( (data) => {      
        this.characters = data;
      });      
    },

    deleteCharacter : function (event) {
      var characterId = $(event.currentTarget).data('id');
      var docClient = dbSvc.GetDbClient();
      var params = {
          TableName: fs_char.config.charactertable,
          Key: {
            'character_owner_id': this.userId,
            'character_id': characterId
          }
      };

      console.log("Deleting a character...");
      docClient.delete(params, (err, data) => {
        if (err) {
            commonSvc.Notify(err.message || JSON.stringify(err));
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            $('#modalDeleteCharacterConfirm').modal('hide');
            console.log("Deleted item:", JSON.stringify(data, null, 2));
            commonSvc.Notify('Character deleted.', 'success', 2000);
            this.list();
        }
      });
    },

    searchByTag : function(event) {
      var tag = $(event.currentTarget).data('search-text');
      this.$store.commit('updateSearchText', tag)
      commonSvc.Search(tag);
    },
    clearFilter : function() {
      this.$store.commit('updateSearchText', "");
      commonSvc.Search("");
    },

  }
}
</script>
