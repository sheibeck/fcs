<template>
  <div class="">
      <div class="input-group">
        <input id="search-text" class="form-control" type="text" placeholder="Search" v-model="$store.state.searchText" @input="search" />
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="button" v-on:click="clearSearch"><i class="fa fa-times-circle"></i></button>
          <button id="search-button" class="btn btn-outline-success d-none" type="button" v-on:click="search">Search</button>
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Search',
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
    clearSearch : function() {
      this.$store.commit("updateSearchText", "");
      $("#search-button").trigger("click");
    },
    search : function() {
      let searchText = this.$store.state.searchText;
      fatesheet.search(searchText);
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
