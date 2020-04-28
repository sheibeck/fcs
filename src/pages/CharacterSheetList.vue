<template>
  <div class="container mt-2">
      <div class="d-md-flex">
        <h1 class="mr-auto justify-content-center d-none d-md-block">Character Sheets</h1>
        <div class="mr-auto d-md-none"></div>
        <search class="mt-0 mt-md-1 mb-1"></search>
      </div>
      <div class='card-columns'>
        <div v-for='sheet in sheets' class='card'>
          <img class='card-img-top img-thumbnail img-fluid' v-bind:src="`/static/sheets/${sheet.slug}/logo.png`" v-bind:alt="sheet.displayname + ' Logo'" />
          <div class='card-body'>
            <h5 class='card-title charactersheet-name'>{{sheet.system}}</h5>
            <a v-bind:href="`charactersheet/${sheet.slug}`" class='btn btn-success' v-bind:data-id='sheet.id' role="button">Create Character <i class='fa fa-user'></i></a>
          </div>
          <div class='card-footer text-muted small' v-html="sheet.description">

          </div>
         </div>
      </div>

      <button v-on:click="migrateData()">Migrate Data</button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Search from '../components/search';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';

import DbTools from '../assets/js/dbTools';
let dbTools = null;

let dbSvc = null;
let commonSvc= null;

export default {
  name: 'CharacterSheetList',
  metaInfo: {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Character Sheets',
  },
  components: {
    search: Search,
  },
  mounted(){
    dbSvc = new DbService(this.$root);
    commonSvc= new CommonService(this.$root);
    dbTools = new DbTools(this.$root);
    fs_char.init(this.$root);
  },
  watch: {
    userId() {      
      this.list();
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  data () {
    return {
      title: "Character Sheets",
      sheets: {}
    }
  },
  methods : {
    migrateData() {
      dbTools.MigrateData();
    },

    getSheetLogoUrl(id) {
      let folderName = id.split("|")[1];
      return `/static/sheets/${folderName}/logo.png`;
    },

    list : function(searchText){
      let items = dbSvc.ListObjects("CHARACTERSHEET", commonSvc.GetRootOwner(), searchText).then( (data) => {
        if (data.length > 0)
          this.sheets = data;
        else
          return;
      });
    }
  },
  clearFilter : function() {
    this.$store.commit('updateSearchText', "");
    commonSvc.Search("");
  }
}
</script>