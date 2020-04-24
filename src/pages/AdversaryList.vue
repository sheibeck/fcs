<template>
  <div class="container mt-2">
    <!-- list of adversaries -->
    <div class='js-adversary-list'>

      <div v-if="!id" class="d-print-none mb-2 d-md-flex">
        <a v-if="!isAuthenticated" href='/login' type="button" class="btn btn-primary mb-1 mb-md-0 mr-auto">
            Login to Create an Adversary <span class='dice'>A</span>
        </a>

        <a v-if="isAuthenticated" role="button" href="/adversary/edit" class="btn btn-success js-create-adversary mb-1 mb-md-0">
          Create Adversary <i class='fa fa-plus'></i>
        </a>

        <div v-if="isAuthenticated" class="pt-2 pl-2 mr-auto ">
          <input type="checkbox" class="" id="my_adversaries" v-bind:checked="adversaryListDefault" v-on:change="toggleAdversaryListDefault()" />
          <label class="form-check-label" for="my_adversaries">Show only my adversaries?</label>
        </div>

        <search class=""></search>
    </div>
      </div>

      <div class='card-columns' id="adversaryDetail">
        <div class='card' v-for="item in adversaries" v-bind:key="item.adversary_id">
          <img v-if="item.adversary_image" class="card-img-top img-fluid img-thumbnail" style="object-fit: cover; object-position:top; max-height: 180px;" v-bind:src="item.adversary_image" v-bind:alt="item.adversary_name + 'Image'">

          <h4 class='card-header adversary-name bg-light'>
            <a v-bind:href="'/adversary/' + item.adversary_slug" style="text-decoration:none;">{{item.adversary_name}}</a>
            <small v-if="isOwner(item.adversary_owner_id)">
              <a v-if="isOwner(item.adversary_owner_id)" v-bind:href="'/adversary/edit/' + item.adversary_slug" class='d-print-none' style="color: #888 !important;"><i class='fa fa-edit'></i></a>
            </small>
          </h4>

          <div v-if="!isEmpty(item.adversary_aspects)">
            <h5 class='card-header py-0'>Aspects</h5>
            <p class='card-text px-4 my-0' v-for="aspect in item.adversary_aspects">
              <strong>{{fixLabel(aspect)}}</strong>
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_skills)">
            <h5 class='card-header py-0'>Skills</h5>

            <p class='card-text px-4 my-0' v-for="(skill, skillIndex) in item.adversary_skills">
                <strong>{{skillIndex}}</strong> {{fixLabel(skill)}}
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_stunts)">
            <h5 class='card-header py-0'>Stunts & Extras</h5>

            <p class='card-text px-4 my-0' v-for="(stunt, stuntIndex) in item.adversary_stunts">
                <strong>{{stuntIndex}}</strong> {{fixLabel(stunt)}}
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_stress)">
            <h5 class='card-header py-0'>Stress</h5>

            <p class='card-text px-4 my-0' v-for="(stressMain, stressMainIndex) in item.adversary_stress">
                <strong>{{stressMainIndex}}</strong>
                <span v-for="(stressValue, stressIndex) in stressMain">
                  <input type='checkbox' v-bind:value='stressValue'>{{stressValue}}
                </span>
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_consequences)">
            <h5 class='card-header py-0'>Consequences</h5>

            <p class='card-text px-4 my-0' v-for="(con, conIndex) in item.adversary_consequences">
                <strong>{{conIndex}}</strong> {{fixLabel(con)}}
            </p>
          </div>

          <div class='card-footer'>
              <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.adversary_system' v-on:click="searchByTag">{{item.adversary_system}}</span>
              <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.adversary_genre' v-on:click="searchByTag">{{item.adversary_genre}}</span>
              <span v-bind:class="badgeColor(item.adversary_type) + ' badge js-adversary-tag'" v-bind:data-search-text='item.adversary_type' v-on:click="searchByTag">{{item.adversary_type}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Search from '../components/search'
import AdversaryService from "./../assets/js/adversaryService";
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

let adversarySvc = null;
let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterList',
  components: {
    search: Search,
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
    adversarySvc = new AdversaryService(dbSvc);
    fs_adversary.init(this.$root);
  },
  metaInfo() {
    return {
       title: this.title,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'searchText'
    ]),
    adversaryListDefault() {
      if ($cookies.get("fcsAdversaryListDefault"))
      {
       return true; 
      }
      
      return false;      
    }
  },
  watch: {
    userId() {
      //wait for our authentication      
      this.list();
    }
  },
  data () {
    return {
      title: "Adversary List",
      id: this.$route.params.id,
      adversaries: [],
      title: "Adversary List",
      description: "Fate Adversaries",
    }
  },
  methods : {
    toggleAdversaryListDefault : function() {
      if ($('#my_adversaries').is(':checked')) {
        $cookies.set("fcsAdversaryListDefault", "mine");
      }
      else {
        $cookies.remove("fcsAdversaryListDefault");
      }
      this.list();
    },
    list : async function (searchText) {      
      let onlyShowMyAdversaries = $cookies.get("fcsAdversaryListDefault") ? this.$store.state.userId : null;
      this.adversaries = await adversarySvc.list(this.id ? this.id : searchText, onlyShowMyAdversaries);
      
      //make the display wider if we only have 1 adversary, this is
      //essentially the adversary "detail" page
      if (this.adversaries.length === 1)
      {
          $('#adversaryDetail').removeClass('card-columns');

          this.title = this.adversaries[0].adversary_name + ' (Adversary)';
          this.description = this.adversaries[0].adversary_type;
      }
      else {
          $('#adversaryDetail').addClass('card-columns');

          this.title = "Adversary List";
          this.description = "Fate Adversaries";
      }
    },
    fixLabel: function (val) {
        return val.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });;
    },
    isEmpty: function(obj) {
      for(var key in obj) {
          if(obj.hasOwnProperty(key))
              return false;
      }
      return true;
    },
    badgeColor: function(type) {
      var badge;

      switch(type) {
        case "Enemy":
          badge = "badge-danger";
          break;
        case 'Obstacle':
          badge = "badge-warning";
          break;
        case "Constraint":
          badge = "badge-info";
          break;
        default:
          badge = "badge-dark";
          break;
      }

      return badge;
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
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    }
  }
}
</script>
