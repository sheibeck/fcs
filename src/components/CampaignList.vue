<template>
  <div class="container mt-2">
    <div v-if="isAuthenticated" class="d-print-none mb-2 d-flex">      
      <a href='/campaign/create' class='btn btn-success mr-auto'>Create a Campaign <i class='fa fa-globe-americas'></i></a>
            
      <button type="button" class="btn btn-warning btn-sm mr-1" v-show="isFiltered" v-on:click="clearFilter()"><i class="fas fa-times"></i> Clear Filter</button>      
    </div>
    <div class='card-columns'>
      <div v-for="item in filteredCampaigns" v-bind:key="item.id" class='card'>
        <div class='card-body'>
          <h5 class='card-title campaign-name'>{{item.title}}</h5>
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
            <a :href="`/campaign/${item.id}/${item.slug}`" class='btn btn-primary mr-auto' v-bind:data-id='item.id'>Play <i class='fa fa-play-circle'></i></a>
            <!--<a href='#' class='btn btn-secondary js-share'>Share <i class='fa fa-share-square'></i></a>-->
            <a href='#' class='btn' style='color:red' v-bind:data-id='item.id' data-toggle='modal' data-target='#modalDeleteConfirm'><i class='fa fa-trash'></i></a>
          </div>
        </div>
        <div class='card-footer text-muted'>
          <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='item.scale' v-on:click="searchByTag">{{item.scale}}</span>
          @ <span class=''>{{new Date(item.date).toLocaleString()}}</span>
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
import { mapGetters } from 'vuex'

export default {
  name: 'CampaignList',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'My Campaigns',      
  },
  created(){
    fs_camp.init();
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
    getValue: function(index, item) {
          var itemValue = eval(`this.campaigns[${index}].${item}`);
          return itemValue;
    },
    list : function () {
      //reference this component so we can get/set data
      var $component = this;

      // Create DynamoDB document client
      var docClient = fatesheet.getDBClient();

      var params = {
          TableName: fs_camp.config.campaigntable,
          Select: 'ALL_ATTRIBUTES',
          ExpressionAttributeValues: {':owner_id' : $component.userId, ':parent_id' :  fatesheet.emptyGuid()},
          FilterExpression: 'owner_id = :owner_id AND parent_id = :parent_id'
      }

      docClient.scan(params, function (err, data) {
          if (err) {
              console.log("Error", err);
          } else {            
              console.log("Success", data.Items);
              $component.campaigns = data.Items;
          }
      });
    },

    deleteCampaign : function (event) {
      var campaignId = $(event.currentTarget).data('id');

      //reference this component so we can get/set data
      var $component = this;

      var docClient = fatesheet.getDBClient();

      $component.deleteCampaignLogs(campaignId);  
    },

    deleteCampaignLogs : function (campaignId) {
      //reference this component so we can get/set data
      var $component = this;

      // Create DynamoDB document client
      let docClient = fatesheet.getDBClient();

      //get a list of all the logs for this campaign
      let params = {
          TableName: fs_camp.config.campaigntable,
          Select: 'ALL_ATTRIBUTES',
          FilterExpression: '(owner_id = :owner_id) AND (parent_id = :parent_id)',
          ExpressionAttributeValues: {            
            ':owner_id': $component.userId,
            ':parent_id': campaignId
          }
      }

      docClient.scan(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {           
            console.log("Success", data.Items[0]);
            let sessions = data.Items;

            var hasErrors = "";
            try {
              sessions.forEach(function(item) {          
                docClient.delete({Key:{owner_id: $component.userId, id: item.id},TableName:fs_camp.config.campaigntable}, (error) => {
                    if (error) {                        
                        throw error;                        
                    }
                });
              });
            } catch(error) {
              hasErrors = error;
            }

            if (hasErrors) {
                fatesheet.notify(err.message || JSON.stringify(err));
                console.error("Unable to delete campaign logs.");
            } else {              
                console.log("Campaign logs deleted.", JSON.stringify(data, null, 2));
                               
                //now that the logs are gone, delete the campaign itself
                $component.deleteCampaignActual(campaignId);
            }   
          }
      });
    },

    deleteCampaignActual(campaignId) {
      var $component = this;
      var docClient = fatesheet.getDBClient();

      var params = {
          TableName: fs_camp.config.campaigntable,
          Key: {
            'owner_id': $component.userId,
            'id': campaignId
          }
      };

      console.log("Deleting campaign ...");
      docClient.delete(params, function (err, data) {
          if (err) {
              fatesheet.notify(err.message || JSON.stringify(err));
              console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
          } else {              
              console.log("Deleted item:", JSON.stringify(data, null, 2));
              fatesheet.notify('Campaign deleted.', 'success', 2000);
              $component.list();
          }
      });
    },

    clearFilter : function() {
      this.$store.commit('updateSearchText', "");
      fcs.$options.filters.filterCampaigns();
    },

    searchByTag : function(event) {
      var $elem = $(event.currentTarget);
      var tag = $elem.data('search-text');
      this.$store.commit('updateSearchText', tag);      
      fcs.$options.filters.filterCampaigns();
    },

  }
}
</script>
