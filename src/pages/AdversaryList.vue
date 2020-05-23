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
        <div class='card' v-for="item in adversaries" v-bind:key="item.id">
          <img v-if="item.image_url" class="card-img-top img-fluid img-thumbnail" style="object-fit: cover; object-position:top; max-height: 180px;" v-bind:src="item.image_url" v-bind:alt="item.name + 'Image'">

          <h4 class='card-header adversary-name bg-light'>
            <a v-bind:href="`/adversary/${commonSvc.GetId(item.id)}/${item.slug}`" style="text-decoration:none;">{{item.name}}</a>
            <small v-if="isOwner(item.owner_id)">
              <a v-if="isOwner(item.owner_id)" v-bind:href="`/adversary/edit/${commonSvc.GetId(item.id)}`" class='d-print-none' style="color: #888 !important;"><i class='fa fa-edit'></i></a>
            </small>
          </h4>

          <div v-if="!isEmpty(item.aspects)">
            <h5 class='card-header py-0'>Aspects</h5>
            <p class='card-text px-4 my-0' v-for="aspect in item.aspects">
              <span v-if="hasRoll20" class="dice fo20" v-on:click="sendToRoll20('invoke', 'aspects', aspect)">C</span>
              <strong>{{fixLabel(aspect)}}</strong>
            </p>
          </div>

          <div v-if="!isEmpty(item.skills)">
            <h5 class='card-header py-0'>Skills</h5>

            <p class='card-text px-4 my-0' v-for="(skill, skillIndex) in item.skills">
                <span v-if="hasRoll20" class="dice fo20" v-on:click="sendToRoll20('diceroll', 'skill', skill, skillIndex)">+</span>
                <strong>{{skillIndex}}</strong> {{fixLabel(skill)}}
            </p>
          </div>

          <div v-if="!isEmpty(item.stunts)">
            <h5 class='card-header py-0'>Stunts &amp; Extras</h5>

              <p class='card-text px-4 my-0' v-for="(stunt, stuntIndex) in item.stunts">
              <span v-if="hasRoll20" class="dice fo20" v-on:click="sendToRoll20('stuntextra', stuntIndex, stunt)">A</span>
              <strong>{{stuntIndex}}</strong> {{fixLabel(stunt)}}
            </p>
          </div>

          <div v-if="!isEmpty(item.stress)">
            <h5 class='card-header py-0'>Stress</h5>

            <p class='card-text px-4 my-0' v-for="(stressMain, stressMainIndex) in item.stress">
                <span v-if="hasRoll20" class="dice fo20">D</span>
                <strong>{{stressMainIndex}}</strong>
                <span v-for="(stressValue, stressIndex) in stressMain">
                  <input type='checkbox' v-bind:value='stressValue' @change="sendToRoll20(`stress`, `${stressValue}${stressMainIndex !== 'Stress' ? ' '+stressMainIndex : ''}`, $event.target.checked)">{{stressValue}}
                </span>
            </p>
          </div>

          <div v-if="!isEmpty(item.consequences)">
            <h5 class='card-header py-0'>Consequences</h5>

            <p class='form-inline card-text px-4 my-0 d-flex' v-for="(con, conIndex) in item.consequences">
                <strong>{{conIndex}}</strong> {{fixLabel(con)}}
                <input v-if="hasRoll20" class="ml-2 form-control input-sm" @change="sendToRoll20(`consequence`, `${con} ${conIndex}`, $event.target.value)">
            </p>
          </div>

          <div class='card-footer'>
              <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.system' v-on:click="searchByTag">{{item.system}}</span>
              <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.genre' v-on:click="searchByTag">{{item.genre}}</span>
              <span v-bind:class="badgeColor(item.type) + ' badge js-adversary-tag'" v-bind:data-search-text='item.type' v-on:click="searchByTag">{{item.type}}</span>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Search from '../components/search'
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import FateOf20 from '../assets/js/fateof20'

let commonSvc = null;
let dbSvc = null;
let fateOf20 = null;

export default {
  name: 'CharacterList',
  components: {
    search: Search,
  },
  mounted(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
    fateOf20 = new FateOf20();

    this.adversaryId = this.$route.params.id ? commonSvc.SetId("ADVERSARY", this.$route.params.id) : null;
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
      'searchText',
      'roll20Enabled'
    ]),
    adversaryListDefault() {
      if ($cookies.get("fcsAdversaryListDefault"))
      {
       return true; 
      }
      
      return false;      
    },  
    commonSvc() {
      return commonSvc;
    },
    hasRoll20() {      
      return this.isAuthenticated && this.roll20Enabled && this.adversaryId;
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
    
      if (this.adversaryId) {
        //we are expecting an array, so if we fetch a single object maintain the expected array for rendering
        let singleAdversary = await dbSvc.GetObject(this.adversaryId);

        if (!singleAdversary) {
          commonSvc.Notify(`Could not find adversary with id <b>${commonSvc.GetId(this.adversaryId)}</b>`, 'error', 2000, () => {
            document.location = '/adversary';
          });
        }
        else {
          //we need this to be an array to properly populate the fields, which is expecting an array
          this.adversaries = [singleAdversary];

          $('#adversaryDetail').removeClass('card-columns');

          this.title = this.adversaries[0].name + ' (Adversary)';
          this.description = this.adversaries[0].type;
        }
      }
      else {
        if (onlyShowMyAdversaries) {
          this.adversaries = await dbSvc.ListObjects("ADVERSARY", this.$store.state.userId, searchText);
        }
        else{      
          this.adversaries = await dbSvc.ListObjects("ADVERSARY", null, searchText);
        }

         $('#adversaryDetail').addClass('card-columns');

          this.title = "Adversary List";
          this.description = "Fate Adversaries";
      }        
    },
    fixLabel: function (val) {
        return val.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });;
    },
    isEmpty: function(obj) {
      return commonSvc.IsEmpty(obj);
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
    },
    sendToRoll20(type, description, data, data2) { 
      let character = this.adversaries[0].name;
      let msg = null;
      switch(type) {
        case "diceroll":          
          let desc2 = "";
          let rollModifier = parseInt(data);  //try to match it straight up

          if (rollModifier == 'NaN')
          {
            var findModifier = data.match(/(\d)/);
            if (findModifier) {
              rollModifier = findModifier[0];
              desc2 = data2;            
            }
            else {
              findModifier = data2.match(/(\d)/);
              if(findModifier) {
                rollModifier = findModifier[0];
              }
              desc2 = data;
            }
          }

          msg = fateOf20.MsgDiceRoll(character, `${description} ${desc2}`, rollModifier);
          break;
        case "invoke":
          msg = fateOf20.MsgInvoke(character, description, data);
          break;
        case "stuntextra":          
          msg = fateOf20.MsgStuntExtra(character, `${description}: ${data}`);
          break;
        case "fatepoint":          
          msg = fateOf20.MsgFatePoint(character, description, data);
          break;
        case "stress":
          msg = fateOf20.MsgStress(character, description, data);
          break;
        case "consequence":
          msg = fateOf20.MsgConsequence(character, description, data);
          break;      
      }
      fateOf20.SendMessage(msg);
    },
  }
}
</script>
