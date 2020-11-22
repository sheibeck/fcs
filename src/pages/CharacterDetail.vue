<template>
  <div class="container mt-2"> 

      <charactersheet v-if="characterData" :character="characterData" :sheetid="characterData.related_id" :isOwner="isOwner" @save-character="save"/>

      <div class="d-print-none">
        <hr/>

        <div class="d-flex">
          <button v-if="isAuthenticated && isOwner" type='button' v-on:click="save" class='btn btn-success mr-1'>Save Character <i class='fa fa-user'></i></button>
          <a href="/character" role='button' class='btn btn-secondary d-print-none mr-1'>Close <i class='fa fa-times-circle'></i></a>
          <button type='button' class='btn btn-dark' @click='print'>Print Character <i class='fa fa-print'></i></button>          
        </div>
       
        <characterprops v-if="characterData" class="pt-1" :characterData="characterData" :isCustomizable="IsCustomizableSheet" :isOwner="isOwner"></characterprops>

      </div>         
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import CharacterSheet from '../components/charactersheet'
import CharacterProps from '../components/characterprops'

import DbTools from '../assets/js/dbTools';


let commonSvc = null;
let dbSvc = null;

export default {
  name: 'CharacterDetail',
  components: {
    "charactersheet": CharacterSheet,  
    "characterprops": CharacterProps
  },
  metaInfo() {    
    return {      
       title: `${this.characterData ? this.characterData.name : this.pageTitle}`,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  async mounted(){
    await this.init();
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'pageTitle',
    ]),
    isOwner() {      
      return this.characterData && this.characterData.owner_id == this.userId;
    },
    IsCustomizableSheet() {
      return this.characterData && this.characterData.related_id === "CHARACTERSHEET|fate-anything";
    },       
  },  
  data () {
    return {
      sheet: "",      
      sheetId: null,
      title: "",
      description: "",
      characterid: null,
      characterData: null,          
    }
  },
  methods : {
    migrateData() {
      let dbToolsSvc = new DbTools(this.$root);
      dbToolsSvc.UpdateItem(this.characterId, this.userId);
    },
    async init() {
      commonSvc = new CommonService(this.$root);    
      dbSvc = new DbService(this.$root); 
      
      this.sheetId = commonSvc.SetId("CHARACTERSHEET", this.$route.params.sheetname);
      this.characterId = commonSvc.SetId("CHARACTER", this.$route.params.id);

      this.show();
    },      
    exists(parent, value, defaultValue) {
      return parent && parent[value] ? parent[value] : (defaultValue || "");
    },
    async show() {     
      this.characterData = await dbSvc.GetObject(this.characterId);
      if (this.characterData == null) {
        commonSvc.Notify(`Could not find character with id <b>${commonSvc.GetId(this.characterId)}</b>`, 'error', 2000);
      }     
    },   
    async save() {
      if (this.isAuthenticated && this.characterId && this.isOwner) {
        var characterData = this.characterData
        
        if (!characterData.name) {
          commonSvc.Notify('You must enter a name', 'error');
          return;
        }

        // make sure we have a proper user id key
        characterData.owner_id = this.userId;
        characterData.related_id = this.sheetId;
        characterData.slug = commonSvc.Slugify(characterData.name);
        characterData.object_type = "CHARACTER";
        characterData.search_data = commonSvc.parseSearchData(characterData);

        let response = await dbSvc.SaveObject(characterData).then((response) => { 
          if (response) {
            commonSvc.Notify('Character saved.', 'success');
          }
        });
      }      
    },
   
    print() {
      if (typeof(window.print) === "function") {
        window.print();
      }      
    },
   
  }
}
</script>

<style lang="scss">
  .autocomplete-input {    
    padding: 7px 12px 7px 48px !important;    
  }
</style>