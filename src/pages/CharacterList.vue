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
            <p v-if="item.image_url" class='col-12 col-md-5 text-center'>
              <img v-bind:src="item.image_url" class='img-fluid' />
            </p>
            <p class='card-text col-12 col-md-7'>
              <label class='h6'>High Concept</label>: {{item.aspects.highconcept}}<br>
              <label class='h6'>Trouble</label>: {{item.aspects.trouble}}
            </p>
          </div>
          <hr />
          <div class="d-flex">
            <a :href='slugify[index]' class='btn btn-primary' v-bind:data-id='item.id'>Play <i class='fa fa-play-circle'></i></a>
            <a :href='slugify[index]' class='btn btn-secondary ml-1 mr-auto' v-on:click="shareUrl">Share <i class='fa fa-share-square'></i></a>
            <a href='#' class='btn' style='color:red' v-bind:data-id='item.id' data-toggle='modal' data-target='#modalDeleteCharacterConfirm'><i class='fa fa-trash'></i></a>
          </div>
        </div>
        <div class='card-footer text-muted'>
          <div v-if="item.description" class='small'>
            {{item.description}}
          </div> 
          <div>
            <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='item.system' v-on:click="searchByTag">{{item.system}}</span>
            <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='commonSvc.GetId(item.related_id)' v-on:click="searchByTag">{{commonSvc.GetId(item.related_id)}}</span>
          </div>
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
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let commonSvc = null;
let dbSvc = null;

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
    fs_char.init(this.$root);
  },
  computed: {
    slugify: function() {
      return this.characters.map(function(item) {
          return '/character/' + commonSvc.GetId(item.related_id) + '/' + commonSvc.GetId(item.id) + '/' + commonSvc.Slugify(item.name);
      });
    },
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'searchText'
    ]),
    commonSvc() {
      return commonSvc;
    },
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
    list : function (searchText) {      
      let items = dbSvc.ListObjects("CHARACTER", this.$store.state.userId, searchText).then( (data) => {    
        this.characters = data;
      });    
    },

    deleteCharacter : function (event) {
      var characterId = $(event.currentTarget).data('id');           
      dbSvc.DeleteObject(  this.userId, characterId ).then( (response) => {
        if (response.error) {
            commonSvc.Notify(response.error.message || JSON.stringify(err));            
        } else {
            $('#modalDeleteCharacterConfirm').modal('hide');            
            commonSvc.Notify('Character deleted.', 'success', 2000);
            this.list();
        }
      });
    },
    shareUrl : function(event) {
      event.preventDefault();
      commonSvc.CopyTextToClipboard(event.currentTarget.href);
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
