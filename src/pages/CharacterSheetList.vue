<template>
  <div class="container mt-2">
      <div class="d-md-flex">
        <h1 class="mr-auto justify-content-center d-none d-md-block">Character Sheets</h1>
        <div class="mr-auto d-md-none"></div>
        <search class="mt-0 mt-md-1 mb-1"></search>
      </div>
      <div class='d-flex flex-column flex-md-row flex-wrap justify-content-between'>
        <div v-for='sheet in sheets' :key="sheet.id" class="card m-1 col col-sm-12 col-md-2 p-0">
          <a v-bind:href="`charactersheet/${sheet.slug}`" v-bind:data-id='sheet.id' role="button">
            <img class='card-img-top img-thumbnail sheet-images' v-bind:src="`/static/sheets/${sheet.slug}/logo.png`" v-bind:alt="sheet.displayname + ' Logo'" />
          </a>
          <div class='card-body'>
            <h5 class='card-title charactersheet-name mb-auto'>{{sheet.name}}</h5>
            <a v-bind:href="`charactersheet/${sheet.slug}`" class='btn btn-success w-100' v-bind:data-id='sheet.id' role="button">Create <i class='fa fa-user'></i></a>
            <a v-if="sheet.customizable" v-bind:href="`charactersheet/${sheet.slug}-custom`" class='btn btn-success mt-1 w-100' v-bind:data-id='sheet.id' role="button">Customize <i class='fas fa-user-cog'></i></a>
          </div>
          <div class='card-footer text-muted small' v-html="sheet.description">

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
      sheets: [{
        "system": "Fate Condensed",
        "object_type": "CHARACTERSHEET",
        "slug": "fate-condensed",
        "description": "Fate Condensed sheet with customizable skills",
        "id": "CHARACTERSHEET|fate-condensed",
        "name": "Fate Condensed",
        "sort": 1,
      },
      {
        "system": "Fate Core",
        "object_type": "CHARACTERSHEET",
        "slug": "fate-core",
        "description": "Fate Core default sheet OR <em>Customize</em> your own skills.",
        "id": "CHARACTERSHEET|fate-core",
        "name": "Fate Core",
        "customizable": true,
        "sort": 3,
      }, 
      {
        "system": "Fate Accelerated",
        "object_type": "CHARACTERSHEET",
        "slug": "fate-accelerated",
        "description": "Fate Accelerated default sheet OR <em>Customize</em> your own approaches.",
        "id": "CHARACTERSHEET|fate-accelerated",
        "name": "Fate Accelerated",
        "customizable": true,
        "sort": 7,
      }, {
        "system": "Fate Anything",
        "object_type": "CHARACTERSHEET",
        "slug": "fate-anything",
        "description": "A customizable character sheet for anything you can come up with.",
        "id": "CHARACTERSHEET|fate-anything",
        "name": "Fate Anything",
        "sort": 1,
      }, {
        "system": "Dresden Files Accelerated",
        "object_type": "CHARACTERSHEET",
        "slug": "dresden-files-accelerated",
        "description": "Dresden Files Accelerated character sheet.",
        "id": "CHARACTERSHEET|dresden-files-accelerated",
        "name": "Dresden Files Accelerated",
        "sort": 3,      
      }, {
        "system": "Fate Of Cthulhu",
        "object_type": "CHARACTERSHEET",
        "slug": "fate-of-cthulhu",
        "description": "Fate of Cthulhu character sheet.",
        "id": "CHARACTERSHEET|fate-of-cthulhu",
        "name": "Fate of Cthulhu",
        "sort": 8,
      }, {
        "system": "Fate Accelerated",
        "object_type": "CHARACTERSHEET",
        "slug": "middle-earth",
        "description": "Fate Accelerated customized for Middle Earth.",
        "id": "CHARACTERSHEET|middle-earth",
        "name": "Fate of Middle Earth",
        "sort": 9,
      }, {
        "system": "Fate Accelerated",
        "object_type": "CHARACTERSHEET",
        "slug": "star-trek",
        "description": "Fate Accelerated customized for Star Trek.",
        "id": "CHARACTERSHEET|star-trek",
        "name": "Star Trek Accelerated",
        "sort": 6,
      }, {
        "system": "Fate Accelerated",
        "object_type": "CHARACTERSHEET",
        "slug": "fate-freeport",
        "description": "Fate Freeport character sheet.",
        "id": "CHARACTERSHEET|fate-freeport",
        "name": "Fate Freeport",
        "sort": 5,
      }, {
        "system": "Fate Accelerated",
        "object_type": "CHARACTERSHEET",
        "slug": "mouse-guard",
        "description": "Fate Accelerated customized for Mouse Guard. <a target='_blank' href='https://docs.google.com/document/d/1_dNdDGh_GYyFQ8N7wF9iVNBrdhsCHcBUU68qH0bZeLw'>View Fate of the Guard hack</a>",
        "id": "CHARACTERSHEET|mouse-guard",
        "name": "Fate of the Guard",
        "sort": 2,
      },     
      ]      
    }
  },
  methods : {    
    getSheetLogoUrl(id) {
      let folderName = id.split("|")[1];
      return `/static/sheets/${folderName}/logo.png`;
    },
  },
  clearFilter : function() {
    this.$store.commit('updateSearchText', "");
    commonSvc.Search("");
  },
  list : function() {
    objs.sort((a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0)); 
    return 
  }
}
</script>

<style lang="scss"> 
.sheet-images {
    object-fit: contain;
    object-position: center;
    height: 100px !important;
}
</style>