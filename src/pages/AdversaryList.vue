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

        <div v-if="isAuthenticated" class="pt-0 pt-md-3 pl-2 mr-auto d-flex justify-content-between">
          <div>
            <input type="checkbox" class="" id="my_adversaries" ref="myAdversaries" v-bind:checked="adversaryListDefault" v-on:change="toggleAdversaryListDefault()" />
            <label class="form-check-label" for="my_adversaries">Show only my adversaries?</label>
          </div>
          <div v-if="!moreAdversaries" class="small d-none d-md-block ml-5">
            Viewing {{totalAdversaries}} adversaries
          </div>
          <div v-if="moreAdversaries" class="small d-none d-md-block ml-5">
            Found {{totalAdversaries}} adversaries on {{currentPage}} of {{pagesScanned}} pages
          </div>
        </div>

        <search class=""></search>
      </div>
      <div v-else class="mb-2">
        <a role="button" href="/adversary" class="btn btn-success js-create-adversary mb-1 mb-md-0 d-print-none">
          <i class="fas fa-chevron-circle-left"></i> Adversary List
        </a>
      </div>      
    </div>
    
    <pager :show="moreAdversaries" :more="moreDataAvailable" :firstpage="currentPage == 1" :lastpage="isLastPage" @get-page="handlePage" />

    <div class='card-columns' id="adversaryDetail">
      <div class='card' v-for="item in adversaries" v-bind:key="item.id">
        <img v-if="item.image_url" class="card-img-top list-image" v-bind:src="item.image_url" v-bind:alt="item.name + 'Image'">

        <h4 class='card-header adversary-name bg-light d-flex'>
          <a v-bind:href="`/adversary/${commonSvc.GetId(item.id)}/${item.slug}`" class="mr-auto" style="text-decoration:none;">{{item.name}}</a>            
          <a v-if="isAuthenticated" v-bind:href="`/adversary/${commonSvc.GetId(item.id)}/${item.slug}/copy`" class='d-print-none' title="Copy Adversary" style="color: #888 !important;"><i class="fas fa-copy fa-xs"></i></a>
          <a v-if="isOwner(item.owner_id)" v-bind:href="`/adversary/${commonSvc.GetId(item.id)}/${item.slug}/edit`" title="Edit Adversary" class='d-print-none pl-1' style="color: #888 !important;"><i class='fa fa-edit fa-xs'></i></a>
        </h4>

        <div v-if="!isEmpty(item.aspects)">
          <h5 class='card-header py-0'>Aspects</h5>
          <div v-if="Array.isArray(item.aspects)">
            <p v-for="(aspect,index) in item.aspects" :key="index" class='card-text px-4 my-0' :id="`aspect-${index}`">
              <strong v-if="index==0">High Concept</strong>
              <strong v-if="index==1">Trouble</strong>
              <strong v-if="index>1">Aspect</strong>
              <span v-html="fixLabel(item.name, aspect.name, 'aspect')"></span>
            </p>
          </div>
          <div v-else>
            <p class='card-text px-4 my-0' v-if="item.aspects.high_concept" id="highconcept">              
              <strong>High Concept</strong> <span v-html="fixLabel(item.name, item.aspects.high_concept, 'aspect')"></span>
            </p>
            <p class='card-text px-4 my-0' v-if="item.aspects.trouble" id="trouble">              
              <strong>Trouble</strong> <span v-html="fixLabel(item.name, item.aspects.trouble, 'aspect')"></span>
            </p>
            <p class='card-text px-4 my-0' v-if="item.aspects.other_aspects" id="otherapsects">
              <strong>Aspects</strong> <span v-html="fixLabel(item.name, item.aspects.other_aspects, 'aspect')"></span>
            </p>
          </div>
        </div>

        <div v-if="!isEmpty(item.skills)">
          <h5 class='card-header py-0'>Skills</h5>
          <div v-if="Array.isArray(item.skills)">
            <p class='card-text px-4 my-0' v-for="(skill, index) in item.skills" :key="index" :id="`skill-${index}`">                
                <strong>{{skill.name}}</strong> <span v-html="fixLabel(item.name, skill.value, 'skill', skill.name)"></span>
            </p>
          </div>
          <div v-else>
            <p class='card-text px-4 my-0' v-for="(skill, index) in item.skills" :key="index" :id="`skill-${index}`">                
                <strong>{{index}}</strong> <span v-html="fixLabel(item.name, skill, 'skill', index)"></span>
            </p>
          </div>
        </div>

        <div v-if="!isEmpty(item.stunts)">
          <h5 class='card-header py-0'>Stunts &amp; Extras</h5>

          <div v-if="Array.isArray(item.stunts)">
            <p class='card-text px-4 my-0' v-for="(stunt, stuntIndex) in item.stunts" :key="stuntIndex" :id="`stunt-${stuntIndex}`">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT(item.name, 'stuntextra', stunt.name, stunt.value)">A</span>
              <strong>{{stunt.name}}</strong> {{fixLabel(item.name, stunt.value)}}
            </p>
          </div>
          <div v-else>
            <p class='card-text px-4 my-0' v-for="(stunt, stuntIndex) in item.stunts" :key="stuntIndex" :id="`stunt-${stuntIndex}`">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT(item.name, 'stuntextra', stuntIndex, stunt)">A</span>
              <strong>{{stuntIndex}}</strong> {{fixLabel(item.name, stunt)}}
            </p>
          </div>
        </div>

        <div v-if="!isEmpty(item.stress)">
          <h5 class='card-header py-0'>Stress <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></h5>

          <div v-if="Array.isArray(item.stunts)">
            <p class='card-text px-4 my-0' v-for="(stressTrack, index) in item.stress" :key="index" :id="`stresstrack-${index}`">
                <strong>{{stressTrack.name}}</strong>
                <span v-for="(stressBox, boxIndex) in getStressBoxes(stressTrack.value)" :key="boxIndex" :id="`stresstrack-${index}-stressbox-${boxIndex}`">
                  <input type='checkbox' v-bind:value='stressBox.value' @change="sendToVTT(item.name, `stress`, `${stressBox}${stressTrack.name !== 'Stress' ? ' '+stressTrack.name : ''}`, $event.target.checked)">{{stressBox}}
                </span>
            </p>
          </div>
          <div v-else>
            <p class='card-text px-4 my-0' v-for="(stressMain, stressMainIndex) in item.stress" :key="stressMainIndex" :id="`stresstrack-${stressMainIndex}`">                
                <strong>{{stressMainIndex}}</strong>
                <span v-for="(stressValue, stressIndex) in stressMain" :key="stressIndex">
                  <input type='checkbox' v-bind:value='stressValue' @change="sendToVTT(item.name, `stress`, `${stressValue}${stressMainIndex !== 'Stress' ? ' '+stressMainIndex : ''}`, $event.target.checked)">{{stressValue}}
                </span>
            </p>
          </div>
        </div>

        <div v-if="!isEmpty(item.consequences)">
          <h5 class='card-header py-0'>Consequences <span v-if="vttEnabled" class='dice fo20 font-weight-normal'>D</span></h5>

          <div v-if="Array.isArray(item.stunts)">
            <p class='form-inline card-text px-4 my-0 d-flex' v-for="(con, conIndex) in item.consequences" :key="conIndex" :id="`consequence-${conIndex}`">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT(item.name, 'invoke', 'invoke', consequences[conIndex])">A</span>
              <span v-html="fixLabel(item.name, con)"></span> <strong>{{con.value}}</strong> 
              <input v-if="vttEnabled" class="ml-2 form-control input-sm" @change="sendToVTT(item.name, `consequence`, `${con.name} ${con.value}`, $event.target.value, conIndex)">
            </p>
          </div>
          <div v-else>
            <p class='form-inline card-text px-4 my-0 d-flex' v-for="(con, conIndex) in item.consequences" :key="conIndex" :id="`consequence-${conIndex}`">
              <span v-if="vttEnabled" class="dice fo20" v-on:click="sendToVTT(item.name, 'invoke', 'invoke', consequences[conIndex])">A</span>
              <strong>{{conIndex}}</strong> <span v-html="fixLabel(item.name, con)"></span>
              <input v-if="vttEnabled" class="ml-2 form-control input-sm" @change="sendToVTT(item.name, `consequence`, `${con} ${conIndex}`, $event.target.value, conIndex)">
            </p>
          </div>
        </div>

        <div class='card-footer'>
            <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.system' v-on:click="searchByTag">{{item.system}}</span>
            <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.genre' v-on:click="searchByTag">{{item.genre}}</span>
            <span v-bind:class="badgeColor(item.type) + ' badge js-adversary-tag'" v-bind:data-search-text='item.type' v-on:click="searchByTag">{{item.type}}</span>
            <span v-for="(tag,index) in item.tags" class='badge badge-secondary mr-1' style="cursor: pointer;" :key="tag.text" :id="`tag-${index}`"
              v-bind:data-search-text='tag.text' v-on:click="searchByTag">                
              {{tag.text}}
            </span>
        </div>
      </div>
    </div>

    <pager :show="moreAdversaries" :more="moreDataAvailable" :firstpage="currentPage == 1" :lastpage="isLastPage" @get-page="handlePage" />

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Search from '../components/search'
import Pager from '../components/pager'
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
  name: 'AdversaryList',
  components: {
    search: Search,
    pager: Pager,
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
      let val = false;

      if ($cookies.get("fcsAdversaryListDefault"))
      {
       val = true; 
      }
                      
      return val;
    },  
    commonSvc() {
      return commonSvc;
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
      consequences: [],
      moreAdversaries: false,
      totalAdversaries: 0,
      pagesScanned: 0,
      currentPage: 0,
      moreDataAvailable: false,
      isLastPage: false,
    }
  },
  methods : {    
    toggleAdversaryListDefault : function() {      
      if (this.$refs.myAdversaries.checked) {
        $cookies.set("fcsAdversaryListDefault", "mine");
      }
      else {
        $cookies.remove("fcsAdversaryListDefault");
      }

      this.list();
    },
    list : async function () {            
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
        this.handlePage('first');
        
        $('#adversaryDetail').addClass('card-columns');

        this.title = "Adversary List";
        this.description = "Fate Adversaries";
      }        
    },
    fixLabel: function (adversary, val, type, data) {          
      let result = val;
      
      if (typeof(val) === "string") {
        result = val.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
      }
      else if (val.name) {        
        result = val.name.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
      }
      else {        
        return val;
      }
        
      if (this.vttEnabled && type) {
        let r20result = "";
        let separator = type == "aspect" ? ";" : ",";
        let items = result.split(separator);

        items.forEach( function (item, index) {
          item = item.trim();
          if (index > 0) r20result+=`${separator} `;
          
          switch(type) {
            case "skill":              
              r20result += `<span class="dice fo20" onclick="fcs.$children[0].$children[0].sendToVTT('${adversary}', 'diceroll', 'skill', '${item.replace(/\'/,'')}', '${data}')">+</span>`
              r20result += item;
              break;
            case "aspect":            
              r20result += `<span class="dice fo20" onclick="fcs.$children[0].$children[0].sendToVTT('${adversary}', 'invoke', 'invoke', '${item.replace(/\'/,'')}')">A</span>`
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
    sendToVTT(character, type, description, data, data2) {       
      if (!this.vttEnabled) return;
      
      let msg = null;      

       switch (this.vttEnabled) {
        case "fcsVtt":
          switch(type) {
            case "diceroll":
              let desc2 = data2;
              let rollModifier = parseInt(data);  //try to match it straight up

              //if data does not contain the skill modifier then try 
              // to extract the modifier out of string
              if (isNaN(rollModifier))
              {
                var findModifier = data.match(/([+-]?\d)/);
                if (findModifier) {
                  rollModifier = findModifier[0];
                  desc2 = data2;
                }
                else {
                  findModifier = data2.match(/([+-]?\d)/);
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
          fcsVtt.SendMessage(msg);
          break;

        case "roll20":              
          switch(type) {
            case "diceroll":
              let desc2 = data2;
              let rollModifier = parseInt(data);  //try to match it straight up

              if (isNaN(rollModifier))
              {
                var findModifier = data.match(/([+-]?\d)/);
                if (findModifier) {
                  rollModifier = findModifier[0];
                  desc2 = data2;            
                }
                else {
                  findModifier = data2.match(/([+-]?\d)/);
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
    async handlePage(page) {      
      let onlyShowMyAdversaries = $cookies.get("fcsAdversaryListDefault") ? this.$store.state.userId : null;
      if (this.searchText !== "") { page = null }; //don't page while searching
      let results;

      if (onlyShowMyAdversaries) {
        //don't page while only viewing your own stuff
        results = await dbSvc.ListObjects("ADVERSARY", this.$store.state.userId, this.searchText); 
        this.totalAdversaries = results.length;
        this.adversaries = results;
        this.moreAdversaries = false;       
      }
      else {
        /* NOTE: paging is currently only enabled when viewing ALL adversaries
                  if you view your own adversaries or perform a search we don't page the results
        */
        if (page) {
          results = await dbSvc.ListObjects("ADVERSARY", null, this.searchText, page);
          if (results) {
            this.pagesScanned = dbSvc.PageList.length;
            this.totalAdversaries = this.pagesScanned * 25;
            this.currentPage = dbSvc.CurrentPage;
            this.moreDataAvailable = results.meta.hasMoreData && this.currentPage == this.pagesScanned;
            this.isLastPage = this.currentPage == this.pagesScanned && !results.meta.hasMoreData;            
            this.adversaries = results.data;
            this.moreAdversaries = results.meta.hasMoreData || dbSvc.PageList.length > 1;
          }          
        } else {
          results = await dbSvc.ListObjects("ADVERSARY", null, this.searchText);          
          this.totalAdversaries = results.length;
          this.adversaries = results;
          this.moreAdversaries = false;
        }
      }      
    },  
    getStressBoxes(obj) {
      if (Array.isArray(obj)) {
        return obj;
      }
      else {
        return obj.split(',');
      }
    }
  }
}
</script>
