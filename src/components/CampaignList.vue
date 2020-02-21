<template>
  <div class="container mt-2">
    <div v-if="isAuthenticated" class="row d-print-none mb-2 hide-on-detail">
      <div class="col-sm-12 col-md-3">
        <a href='/campaign/create' class='btn btn-success'>Create a Campaign <i class='fa fa-globe-americas'></i></a>
      </div>

      <div class="col col-md-3 fs-tools filter hidden">
        <span class="badge badge-warning " style="cursor:pointer;" v-on:click="clearFilter()">x Clear Filter</span>
      </div>
    </div>
    <div class='card-columns'>
      <div v-for="(item, index) in campaigns" class='card'>
        <div class='card-body'>
          <h5 class='card-title campaign-name'>{{item.title}}</h5>
          <div class='row'>
            <p v-if="item.campaign_image_url" class='col-12 col-md-5 text-center'>
              <img v-bind:src="item.campaign_image_url" class='img-fluid' />
            </p>
            <p class='card-text col-12'>                            
              {{item.title}}
            </p>
          </div>
          <hr />
          <a v-bind:href='slugify[index]' class='btn btn-primary' v-bind:data-id='item.id'>Play <i class='fa fa-play-circle'></i></a>
          <a href='#' class='btn btn-secondary js-share'>Share <i class='fa fa-share-square'></i></a>
          <a href='#' class='btn' style='color:red' v-bind:data-id='item.id' data-toggle='modal' data-target='#modalDeleteConfirm'><i class='fa fa-trash'></i></a>

        </div>
        <div class='card-footer text-muted'>
          <span class='badge badge-secondary' style="cursor: pointer;" v-bind:data-search-text='item.scale' v-on:click="searchByTag">{{item.scale}}</span>
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
  computed: {
    slugify: function() {
      return this.campaigns.map(function(item) {
          return '/campaign/' + item.id + '/' + fatesheet.slugify(item.title);
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
      title: "Campaign List",
      campaigns: {}
    }
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
          ExpressionAttributeValues: {':owner_id' : $component.userId },
          FilterExpression: 'owner_id = :owner_id'
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
              $('#modalDeleteCofirm').modal('hide');
              console.log("Deleted item:", JSON.stringify(data, null, 2));
              fatesheet.notify('Campaign deleted.', 'success', 2000);
              $component.list();
          }
      });
    },

    clearFilter : function() {
      $('#search-text').val("");
      $('#search-button').click();
      $('.filter').addClass('hidden');
    },

    searchByTag : function(event) {
      var $elem = $(event.currentTarget);
      var tag = $elem.data('search-text');
      $('#search-text').val(tag);
      $('.filter').removeClass('hidden');
      $('#search-button').click();
    },

  }
}
</script>
