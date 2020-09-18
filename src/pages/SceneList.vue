<template>
  <div class="container mt-2">
    <loading :loading="loading" />
    
    <div v-if="!loading">
      <nav class="nav nav-pills flex-column flex-sm-row mb-3 border-bottom pb-2">
        <a class="text-sm-center nav-link" :class="{ active: isActiveTab('yours') }" href="#" @click.prevent="activateTab('yours')">Your scenes</a>
        <a class="text-sm-center nav-link" :class="{ active: isActiveTab('others') }" href="#" @click.prevent="activateTab('others')">Scenes you've played</a>
      </nav>

      <div v-if="isActiveTab('yours')">
        <div v-if="isSubscriber">        
          <div v-if="isAuthenticated" class="d-print-none mb-2 hide-on-detail d-md-flex">
            <a href='/scene/create' class='btn btn-success mr-auto mb-1 mb-md-0'>Create a Scene <i class="fas fa-book-open"></i></a>
            <search class=""></search>
          </div>
          <div v-if="!hasScenes">         
            <h2>You have not created any scenes.</h2>         
          </div>
          <div v-if="hasScenes" class='card-columns'>
            <div v-for="item in scenes" v-bind:key="item.id" class='card'>
              <div class='card-body'>
                <h5 class='card-title'>{{item.name}}</h5>
                <div class='row'>
                  <p v-if="item.image_url" class='col-12 col-md-5 text-center'>
                    <img v-bind:src="item.image_url" class='img-fluid' />
                  </p>
                  <p class='card-text col'>
                    {{ getShortText(item.description) }}
                  </p>           
                </div>
                <hr />
                <div class="d-flex">
                    <a :href="`/scene/${commonSvc.GetId(item.id)}`" class='btn btn-primary' v-bind:data-id='item.id'>Play <i class='fa fa-play-circle'></i></a>  
                    <a :href="`/scene/${commonSvc.GetId(item.id)}`" class='btn btn-secondary text-white ml-1 mr-auto' v-on:click="shareUrl">Share <i class='fa fa-share-square'></i></a>
                    <a href='#' class='btn' style='color:red' v-bind:data-id='item.id' data-toggle='modal' data-target='#modalDeleteConfirm'><i class='fa fa-trash'></i></a>
                  </div>
              </div>
              <div class='card-footer text-muted'>
                <div v-if="item.players" class='small'>
                  Players: {{ item.players.length }}
                </div> 
                <div>            
                  <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='commonSvc.GetId(item.related_id)' v-on:click="searchByTag">{{commonSvc.GetId(item.related_id)}}</span>
                </div>
              </div>
            </div>
          </div>
          <input id='copyUrl' class='hidden' />

          <!-- delete confirmation modal-->
          <div class="modal fade" id="modalDeleteConfirm" tabindex="-1" role="dialog" aria-labelledby="deleteLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title" id="deleteLabel">Confirm Scene Delete</h5>
                          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                          </button>
                      </div>
                      <div class="modal-body">
                          <p>Are you sure you want to delete this scene?</p>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-danger js-delete" v-on:click="deleteScene">Delete</button>
                          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                      </div>
                  </div>
              </div>
          </div>
        </div>
        <div v-if="!isSubscriber">
          <ctasubscribe />
        </div>
      </div>

      <div v-if="isActiveTab('others')">
        <div v-if="!hasParticipated">
          <h2>You have not participated in others' scenes.</h2>
        </div>
        <div v-if="hasParticipated" class='card-columns'>
          <div v-for="item in othersScenes" v-bind:key="item.id" class='card'>
            <div class='card-body'>
              <h5 class='card-title'>{{item.name}}</h5>
              <div class='row'>
                <p v-if="item.image_url" class='col-12 col-md-5 text-center'>
                  <img v-bind:src="item.image_url" class='img-fluid' />
                </p>
                <p class='card-text col'>
                  {{ getShortText(item.description) }}
                </p>           
              </div>
              <hr />
              <div class="d-flex">
                  <a :href="`/scene/${commonSvc.GetId(item.id)}`" class='btn btn-primary' v-bind:data-id='item.id'>Play <i class='fa fa-play-circle'></i></a>  
                  <a :href="`/scene/${commonSvc.GetId(item.id)}`" class='btn btn-secondary text-white ml-1 mr-auto' v-on:click="shareUrl">Share <i class='fa fa-share-square'></i></a>
                  <a href='#' class='btn' style='color:red' v-bind:data-id='item.id' data-toggle='modal' data-target='#modalDeleteConfirm'><i class='fa fa-trash'></i></a>
                </div>
            </div>
            <div class='card-footer text-muted'>
              <div v-if="item.players" class='small'>
                Players: {{ item.players.length }}
              </div> 
              <div>            
                <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='commonSvc.GetId(item.related_id)' v-on:click="searchByTag">{{commonSvc.GetId(item.related_id)}}</span>
              </div>
            </div>
          </div>
        </div>
        <input id='copyUrl' class='hidden' />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Search from '../components/search';
import Loading from '../components/loading';
import CTASubscribe from '../components/cta-subscribe';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'SceneList',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'My Scenes',
  },
  components: {
    search: Search,
    loading: Loading,
    ctasubscribe: CTASubscribe
  },
  mounted(){   
    this.init();
  },
  computed: {
    hasScenes() {
      return this.scenes.length > 0;
    },
    hasParticipated() {
      return this.othersScenes.length > 0;
    },
    slugify: function() {
      return this.scenes.map(function(item) {
          return '/scene/' + commonSvc.GetId(item.id);
      });
    },
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'searchText',
      'isSubscriber'
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
      title: "Scene List",
      scenes: {},
      othersScenes: {},
      loading: true,
      activeTab: "yours",
    }
  },
  methods : {
    init() {
      commonSvc = new CommonService(this.$root);
      dbSvc = new DbService(this.$root);

      $(document).on('show.bs.modal', '#modalDeleteConfirm', function (event) {        
        var button = $(event.relatedTarget);
        var sceneId = button.data('id');      
        var modal = $(this);
        $(modal.find('.js-delete')).data('id', sceneId);
      });
    },

    isActiveTab(tabName ) {
      return this.activeTab == tabName;
    },

    activateTab(tabName) {      
      this.activeTab = tabName;
    },

    list : async function (searchText) {      
      this.scenes = await dbSvc.ListObjects("SCENE", this.userId, searchText);
      this.othersScenes = await dbSvc.ListObjects("SCENE", null, this.userId);
      this.loading = false;         
    },

    deleteScene : function (event) {
      var sceneId = $(event.currentTarget).data('id');           
      dbSvc.DeleteObject(  this.userId, sceneId ).then( (response) => {  
        if (response) {    
          $('#modalDeleteConfirm').modal('hide');            
          commonSvc.Notify('Scene deleted.', 'success');
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
