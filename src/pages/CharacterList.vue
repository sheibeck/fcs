<template>
  <div class="container mt-2">
    <loading :loading="loading" />
    
    <div v-if="!loading">
      <div v-if="isAuthenticated" class="d-print-none mb-2 hide-on-detail d-md-flex">
        <a href='/charactersheet' class='btn btn-success mr-auto mb-1 mb-md-0'>Create a Character <i class='fa fa-user'></i></a>
        <search class=""></search>
      </div>
      <div v-if="!hasCharacters">
        <h2 v-if="searchText == ''">You have not created any characters.</h2>
        <h2 v-else>No characters found.</h2>
      </div>
      <div v-if="hasCharacters" class='card-columns'>
        <div v-for="(item, index) in characters" v-bind:key="item.id" class='card'>
          <img v-if="item.image_url" v-bind:src="item.image_url" class="card-img-top list-image" alt="character image">
          <div class='card-body'>
            <h5 class='card-title character-name'>{{item.name}}</h5>
            <div class='row'>             
              <p class='card-text col'>
                <label class='h6'>High Concept</label>: {{getAspect(item, "highconcept")}}<br>
                <label class='h6'>Trouble</label>: {{getAspect(item, "trouble")}}
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
              {{ getShortText(item.description) }}
            </div> 
            <div>            
              <span class='badge badge-dark' style="cursor: pointer;" 
                v-bind:data-search-text='commonSvc.GetId(item.related_id)' v-on:click="searchByTag">
                {{commonSvc.GetId(item.related_id)}}
              </span>
              <span v-for="tag in item.tags" class='badge badge-secondary mr-1' style="cursor: pointer;" :key="tag.text"
                v-bind:data-search-text='tag.text' v-on:click="searchByTag">                
                {{tag.text}}
              </span>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Search from '../components/search';
import Loading from '../components/loading';
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
    loading: Loading,
  },
  mounted(){   
    this.init();
  },
  computed: {
    hasCharacters() {
      return this.characters.length > 0;
    },
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
      if (!this.isAuthenticated) {
        location.href = '/';
      }
      //wait for our authenticated user id
      this.list();
    }
  },
  data () {
    return {
      title: "Character List",
      characters: {},
      loading: true,
    }
  },
  methods : {
    init() {
      commonSvc = new CommonService(this.$root);
      dbSvc = new DbService(this.$root);

      $(document).on('show.bs.modal', '#modalDeleteCharacterConfirm', function (event) {        
        var button = $(event.relatedTarget) // Button that triggered the modal
        var characterId = button.data('id') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        $(modal.find('.js-delete-character')).data('id', characterId);
      });
    },
    getAspect(item, aspect) {
      let desc = "";
      if (!item.aspects) return desc;

      switch(aspect) {
        case "highconcept":
          desc = item.aspects ? (item.aspects.highconcept ? item.aspects.highconcept : "") : "";
          if (desc === "" && Object.keys(item.aspects).length > 0) {
            desc = item.aspects[Object.keys(item.aspects).sort()[0]];
          }
          break;

        case "trouble":          
          desc = item.aspects ? (item.aspects.trouble ? item.aspects.trouble : "") : "";
          if (desc === "" && Object.keys(item.aspects).length > 1) {
            desc = item.aspects[Object.keys(item.aspects).sort()[1]];
          }
          break;
      }
      
      return desc;
    },
    list : async function (searchText) {      
      this.characters = await dbSvc.ListObjects("CHARACTER", this.$store.state.userId, searchText);
      this.loading = false;         
    },

    deleteCharacter : function (event) {
      var characterId = $(event.currentTarget).data('id');           
      dbSvc.DeleteObject(  this.userId, characterId ).then( (response) => {  
        if (response) {    
          $('#modalDeleteCharacterConfirm').modal('hide');            
          commonSvc.Notify('Character deleted.', 'success');
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
    getShortText : function(text) {
     return commonSvc.GetShortText(text);
    },
  }
}
</script>
