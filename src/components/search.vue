<template>
  <div class="">
      <div class="input-group">
        <input id="search-text" class="form-control" type="text" placeholder="Search" v-model="$store.state.searchText" />
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="button" v-on:click="clearSearch"><i class="fa fa-times-circle"></i></button>
          <button ref="searchbutton" id="search-button" class="btn btn-outline-success d-none" type="button" v-on:click="search">Search</button>
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";

let commonSvc = null;

export default {
  name: 'Search',
  mounted() {    
    this.init();
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'searchText'
    ]),
  },
  data () {
    return {
    }
  },
  methods: {
    init : function() {
      commonSvc = new CommonService(this.$root);

      // Get the input box
      let input = document.getElementById('search-text');

      // Init a timeout variable to be used below
      let timeout = null;

      // Listen for keystroke events and give the user a little time
      // to type before we really search
      input.addEventListener('keyup', (e) => {      
          clearTimeout(timeout);
          
          timeout = setTimeout( () => {
              this.search();
          }, 500);
      });

    },
    clearSearch : function() {
      this.$store.commit("updateSearchText", "");
      this.$refs.searchbutton.click();
    },
    search : function() {      
      let searchText = this.$store.state.searchText;      
      if (!searchText || searchText.length === 0 || searchText.length > 2) {
        commonSvc.Search(searchText);
      }
    }
  }

}
</script>

<style lang="scss" scoped>

  .input-group-append {
    button {
      border-top-right-radius: 5px !important;
      border-bottom-right-radius: 5px !important;
    }
  }

</style>
