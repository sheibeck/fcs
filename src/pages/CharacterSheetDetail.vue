<template>
  <div class="container mt-2">

      <charactersheet :character="characterData" :sheetid="id" :isOwner="true" />        
        
      <div class="d-print-none">
        <hr/>

        <div class='d-flex'>
          <button v-if="isAuthenticated" type='button' v-on:click="save" class='btn btn-success d-print-none  mr-1'>Save Character <i class='fa fa-user'></i></button>
          <a href="/charactersheet" role='button' class='btn btn-secondary d-print-none mr-1'>Close <i class='fa fa-times-circle'></i></a>
          <button type='button' class='btn btn-dark' @click='print'>Print Character <i class='fa fa-print'></i></button>           
        </div>
        
        <characterprops v-if="characterData" class="pt-1" :characterData="characterData" :isCustomizable="IsCustomizableSheet" :isOwner="true"></characterprops>

      </div>                
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import CharacterSheet from '../components/charactersheet'
import VueTagsInput from '@johmun/vue-tags-input';
import CharacterProps from '../components/characterprops'

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterSheetDetail',
  components: {
    "charactersheet": CharacterSheet, 
    "characterprops": CharacterProps    
  },
  metaInfo() {
    return {
       title: this.pageTitle,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  created() {  
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);
   
    this.sheetId = commonSvc.SetId("CHARACTERSHEET", this.$route.params.id);
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'pageTitle',
    ]), 
    IsCustomizableSheet() {
      return this.characterData && this.characterData.related_id === "CHARACTERSHEET|fate-anything";
    },
  },
  data () {
    return {
      sheet: "",
      id: this.$route.params.id,
      characterId: null,
      title: "",
      description: "",
      characterData: {        
        related_id: `CHARACTERSHEET|${this.$route.params.id}`        
      },
      tag: "",
    }
  },
  methods : {
    updateTags(newTags) {      
      this.characterData.tags = newTags;     
    },   
    exists(parent, value, defaultValue) {
      return parent && parent[value] ? parent[value] : (defaultValue || "");
    },    
    save : async function() {            
      if (this.isAuthenticated) {
        /// save a character       
        let characterData = this.characterData;

        if (!characterData.name) {
          commonSvc.Notify('You must enter a name', 'error');
          return;
        }

        // make sure we have a proper user id key
        characterData.owner_id = this.userId;
        characterData.related_id = commonSvc.SetId("CHARACTERSHEET", this.id);        
        characterData.slug = commonSvc.Slugify(characterData.name);        

        //create a new characterId if we don't have one
        this.characterId = commonSvc.SetId("CHARACTER", commonSvc.GenerateUUID());        
        characterData.id = this.characterId;
        characterData.object_type = "CHARACTER";
        characterData.search_data = commonSvc.parseSearchData(characterData);

        let response = await dbSvc.SaveObject(characterData).then((response) => {
          if (response) {
            commonSvc.Notify('Character saved.', 'success', null, () => {
                location.href = `/character/${this.id}/${commonSvc.GetId(characterData.id)}/${characterData.slug}`;
            });            
          }
        });
      }     
    },
    print() {
      if (typeof(window.print) === "function") {
        window.print();
      }      
    }
  }
}
</script>

