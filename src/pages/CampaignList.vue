<template>
  <div class="container mt-2">
    <div v-if="isAuthenticated" class="d-print-none mb-2 d-md-flex">
      <a href='/campaign/create' class='btn btn-success mr-auto mb-1 mb-md-0'>Create a Campaign <i class='fa fa-globe-americas'></i></a>
      <search class=""></search>
    </div>
    <div class='card-columns'>
      <div v-for="item in filteredCampaigns" v-bind:key="item.id" class='card'>
        <div class='card-body'>
          <h5 class='card-title campaign-name'>{{item.name}}</h5>
          <div class='row'>
            <p v-if="item.image_url" class='col-12 col-md-5 text-center'>
              <img v-bind:src="item.image_url" class='img-fluid' />
            </p>
            <p class='card-text col-12 col-md-7'>
              {{item.description}}
            </p>
          </div>
          <hr />
          <div class="d-flex">
            <a :href="`/campaign/${commonSvc.GetId(item.id)}/${item.slug}`" class='btn btn-primary' v-bind:data-id='item.id'>Play <i class='fa fa-play-circle'></i></a>
            <a :href="`/campaign-summary/${commonSvc.GetId(item.id)}/${item.slug}`" class='btn btn-secondary ml-1 mr-auto' v-on:click="shareUrl">Share <i class='fa fa-share-square'></i></a>
            <a href='#' class='btn' style='color:red' v-bind:data-id='item.id' data-toggle='modal' data-target='#modalDeleteConfirm'><i class='fa fa-trash'></i></a>
          </div>
        </div>
        <div class='card-footer text-muted'>
          <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='item.scale' v-on:click="searchByTag">{{item.scale}}</span>
          @ <span class=''>{{getNiceDate(item.date)}}</span>
        </div>
      </div>
    </div>
    <input id='copyUrl' class='hidden' />

    <!-- delete confirmation modal-->
    <div class="modal fade" id="modalDeleteConfirm" tabindex="-1" role="dialog" aria-labelledby="deleteLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteLabel">Confirm Campaign Delete</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this campaign?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger js-delete" v-on:click="deleteCampaign" data-dismiss="modal">Delete</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
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

let campaignSvc = null;
let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CampaignList',
  metaInfo: {      
      title: 'My Campaigns',
  },
  components: {
    search: Search,
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
    fs_camp.init(this.$root);
  },
  data () {
    return {
      title: "Campaign List",
    }
  },
  watch: {
    userId() {
      //wait for our authenticated user id
      this.list();
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'filteredCampaigns',
      'searchText'
    ]),
    commonSvc() {
      return commonSvc;
    },
    campaigns : {
      get : function() {
        return this.$store.state.campaigns;
      },
      set : function(value) {
        this.$store.commit('updateCampaigns', value);
      }
    },
    isFiltered : function() {
      return this.$store.state.searchText;
    },
  },
  methods : {      
    list : async function () {      
      this.campaigns = await dbSvc.ListObjects("CAMPAIGN", this.userId);
    },
    deleteCampaign : function (event) {
      var campaignId = $(event.currentTarget).data('id');
      dbSvc.DeleteObject(this.userId, campaignId);
    },

    deleteCampaignLogs : async function (campaignId) {
      let sessionList = await dvSvc.ListRelatedObjects(campaignId);

      if (sessionList.error) {
          commonSvc.Notify(err.message || JSON.stringify(err));
      } else {
        let hasErrors = 0;

        //delete sessions
        sessionList.forEach( async (item) => {
          let result = await dbSvc.DeleteObject(this.userId, item.id);
          if (!result) hasErrors++;
        });
        
        if (!hasErrors)
        {
          //delete campaign
          await dbSvc.DeleteObject(this.userId, campaignId).then((response) => {
            if (response) {
              commonSvc.Notify('Campaign deleted.', 'success', 2000);
              this.list();
            }
          });        
        }
        else {
          commonSvc.Notify("There was a problem deleting session logs for this campaign", "error", 2000);
        }
      }
    },   
    shareUrl : function(event) {
      event.preventDefault();
      commonSvc.CopyTextToClipboard(event.currentTarget.href);
    },
    clearFilter : function() {
      this.$store.commit('updateSearchText', "");
      this.$options.filters.filterCampaigns();
    },
    searchByTag : function(event) {
      var $elem = $(event.currentTarget);
      var tag = $elem.data('search-text');
      this.$store.commit('updateSearchText', tag);
      this.$options.filters.filterCampaigns();
    },
    getNiceDate : function(date) {
        return commonSvc.GetNiceDate(date);
    },
  }
}
</script>
