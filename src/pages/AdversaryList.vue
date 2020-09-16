<template>
  <div class="container mt-2">
    <!-- list of adversaries -->
    <div class='js-adversary-list'>

      <div v-if="!id" class="d-print-none mb-2 d-md-flex">
        <a v-if="!isAuthenticated" href='/login' type="button" class="btn btn-primary mb-1 mb-md-0 mr-auto">
            Login to Create an Adversary <span class='dice'>A</span>
        </a>

        <a v-if="isAuthenticated" role="button" href="/adversary/create/new-adversary/edit" class="btn btn-success js-create-adversary mb-1 mb-md-0">
          Create Adversary <i class='fa fa-plus'></i>
        </a>

        <div v-if="isAuthenticated" class="pt-2 pl-2 mr-auto ">
          <input type="checkbox" class="" id="my_adversaries" v-bind:checked="adversaryListDefault" v-on:change="toggleAdversaryListDefault()" />
          <label class="form-check-label" for="my_adversaries">Show only my adversaries?</label>
        </div>

        <search class=""></search>
      </div>
      <div v-else class="mb-2">
        <a role="button" href="/adversary" class="btn btn-success js-create-adversary mb-1 mb-md-0 d-print-none">
          <i class="fas fa-chevron-circle-left"></i> Adversary List
        </a>
      </div>
    </div>

      <div class='card-columns' id="adversaryDetail">
        <div class='card' v-for="item in adversaries" v-bind:key="item.id">
          <img v-if="item.image_url" class="card-img-top img-fluid img-thumbnail" style="object-fit: scale-down; object-position:top; max-height: 180px;" v-bind:src="item.image_url" v-bind:alt="item.name + 'Image'">

          <h4 class='card-header adversary-name bg-light d-flex'>
            <a v-bind:href="`/adversary/${commonSvc.GetId(item.id)}/${item.slug}`" class="mr-auto" style="text-decoration:none;">{{item.name}}</a>            
            <a v-if="isAuthenticated" v-bind:href="`/adversary/${commonSvc.GetId(item.id)}/${item.slug}/copy`" class='d-print-none' title="Copy Adversary" style="color: #888 !important;"><i class="fas fa-copy fa-xs"></i></a>
            <a v-if="isOwner(item.owner_id)" v-bind:href="`/adversary/${commonSvc.GetId(item.id)}/${item.slug}/edit`" title="Edit Adversary" class='d-print-none pl-1' style="color: #888 !important;"><i class='fa fa-edit fa-xs'></i></a>
          </h4>

          <div v-if="!isEmpty(item.aspects)">
            <h5 class='card-header py-0'>Aspects</h5>
            <p class='card-text px-4 my-0' v-if="item.aspects.high_concept">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT('invoke', 'aspect', item.aspects.high_concept)">A</span>
              <strong>High Concept</strong> <span v-html="fixLabel(item.aspects.high_concept)"></span>
            </p>
            <p class='card-text px-4 my-0' v-if="item.aspects.trouble">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT('invoke', 'aspect', item.aspects.trouble)">A</span>
              <strong>Trouble</strong> <span v-html="fixLabel(item.aspects.trouble)"></span>
            </p>
           <p class='card-text px-4 my-0' v-if="item.aspects.other_aspects">
              <strong>Aspects</strong> <span v-html="fixLabel(item.aspects.other_aspects, 'aspect')"></span>
            </p>
          </div>

          <div v-if="!isEmpty(item.skills)">
            <h5 class='card-header py-0'>Skills</h5>

            <p class='card-text px-4 my-0' v-for="(skill, skillIndex) in item.skills" :key="skillIndex">                
                <strong>{{skillIndex}}</strong> <span v-html="fixLabel(skill, 'skill', skillIndex)"></span>
            </p>
          </div>

          <div v-if="!isEmpty(item.stunts)">
            <h5 class='card-header py-0'>Stunts &amp; Extras</h5>

              <p class='card-text px-4 my-0' v-for="(stunt, stuntIndex) in item.stunts" :key="stuntIndex">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT('stuntextra', stuntIndex, stunt)">A</span>
              <strong>{{stuntIndex}}</strong> {{fixLabel(stunt)}}
            </p>
          </div>

          <div v-if="!isEmpty(item.stress)">
            <h5 class='card-header py-0'>Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></h5>

            <p class='card-text px-4 my-0' v-for="(stressMain, stressMainIndex) in item.stress" :key="stressMainIndex">                
                <strong>{{stressMainIndex}}</strong>
                <span v-for="(stressValue, stressIndex) in stressMain" :key="stressIndex">
                  <input type='checkbox' v-bind:value='stressValue' @change="sendToVTT(`stress`, `${stressValue}${stressMainIndex !== 'Stress' ? ' '+stressMainIndex : ''}`, $event.target.checked)">{{stressValue}}
                </span>
            </p>
          </div>

          <div v-if="!isEmpty(item.consequences)">
            <h5 class='card-header py-0'>Consequences <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></h5>

            <p class='form-inline card-text px-4 my-0 d-flex' v-for="(con, conIndex) in item.consequences" :key="conIndex">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT('invoke', 'invoke', consequences[conIndex])">A</span>
              <strong>{{conIndex}}</strong> <span v-html="fixLabel(con)"></span>
              <input v-if="vttEnabled" class="ml-2 form-control input-sm" @change="sendToVTT(`consequence`, `${con} ${conIndex}`, $event.target.value, conIndex)">
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
import FCSVTT from '../assets/js/fcsVTT'
import Models from '../assets/js/models'

let commonSvc = null;
let dbSvc = null;
let fateOf20 = null;
let fcsVtt = null;
let models = null;

export default {
  name: 'CharacterList',
  components: {
    search: Search,
  },
  created(){
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
    fateOf20 = new FateOf20();
    fcsVtt = new FCSVTT();
    models = new Models();

    this.adversaryId = this.$route.params.id ? commonSvc.SetId("ADVERSARY", this.$route.params.id) : null;
  },
  metaInfo() {
    return {
       title: `${this.adversaries.length == 1 ? this.adversaries[0].name : this.title}`,
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
      'vttEnabled'
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
      consequences: [],
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
    fixLabel: function (val, type, data) {
      let result = val.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
      
      if (this.vttEnabled && type) {
        let r20result = "";
        let separator = type == "aspect" ? ";" : ",";
        let items = result.split(separator);

        items.forEach( function (item, index) {
          item = item.trim();
          if (index > 0) r20result+=", ";
          
          switch(type) {
            case "skill":              
              r20result += `<span class="dice fo20" onclick="fcs.$children[0].$children[0].sendToVTT('diceroll', 'skill', '${item.replace(/\'/,'')}', '${data}')">+</span>`
              r20result += item;
              break;
            case "aspect":            
              r20result += `<span class="dice fo20" onclick="fcs.$children[0].$children[0].sendToVTT('invoke', '${type}', '${item.replace(/\'/,'')}')">A</span>`
              r20result += item;            
              break;                         
          }
        });

        return r20result;
      }
      else {
        return result;
      }
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
    sendToVTT(type, description, data, data2) {  
      if (!this.vttEnabled) return;

      let character = this.adversaries[0].name;
      let msg = null;      

       switch (this.vttEnabled) {
        case "fcsVtt":
          switch(type) {
            case "diceroll":
              let desc2 = data2;
              let rollModifier = parseInt(data);  //try to match it straight up

              if (isNaN(rollModifier))
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

              msg = fcsVtt.MsgDiceRoll(character, description, desc2, rollModifier);
              break;
            case "invoke":
              if (!data) return;
              msg = models.MsgInvoke(character, description, data);
              break;
            case "stuntextra":          
              msg = models.MsgStuntExtra(character, `${description}: ${data}`);
              break;
            case "fatepoint":          
              msg = models.MsgFatePoint(character, description, data);
              break;
            case "stress":
            case "condition":
              msg = models.MsgStress(character, description, data);
              break;        
            case "consequence":
              //when dealing with consequences, we'll give them a temporary space for 
              // the value of the consequence so we can invoke it         
              this.consequences[data2] = data;
              msg = models.MsgConsequence(character, description, data);
              break;      
          }
          fcsVtt.SendMessage(msg);
          break;

        case "roll20":              
          switch(type) {
            case "diceroll":
              let desc2 = data2;
              let rollModifier = parseInt(data);  //try to match it straight up

              if (isNaN(rollModifier))
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

              msg = models.MsgDiceRoll(character, description, desc2, rollModifier);
              break;
            case "invoke":
              if (!data) return;
              msg = models.MsgInvoke(character, description, data);
              break;
            case "stuntextra":          
              msg = models.MsgStuntExtra(character, `${description}: ${data}`);
              break;
            case "fatepoint":          
              msg = models.MsgFatePoint(character, description, data);
              break;
            case "stress":
            case "condition":
              msg = models.MsgStress(character, description, data);
              break;        
            case "consequence":
              //when dealing with consequences, we'll give them a temporary space for 
              // the value of the consequence so we can invoke it         
              this.consequences[data2] = data;
              msg = models.MsgConsequence(character, description, data);
              break;      
          }
          fateOf20.SendMessage(msg);               
          break;

       }
    },
  }
}
</script>
