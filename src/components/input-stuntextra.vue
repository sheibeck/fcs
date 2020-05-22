<template>    
	<div class="form-group">    
    <textarea v-if="edit" class="form-control" id="stunts" name="stunts" rows="25" placeholder="Stunts &amp; Extras" @change="$parent.setVal(item,  $event.target.value)" :value="$parent.getVal(item)"></textarea>
    <VueShowdown v-if="!edit" class="h-auto" :markdown="getMarkupVal(item)" />				
  </div>  
</template>

<script>
import VueShowdown, { showdown } from 'vue-showdown';
import { mapGetters } from 'vuex'

export default {
  name: 'InputStuntExtra',
  props: {
    item: String,  
    edit: Boolean,  
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',      
      'roll20Enabled'
    ]),
    hasRoll20() {
      return this.isAuthenticated && this.roll20Enabled;
    }
  },
  data () {
    return {      
    }
  },
  methods: {
    getMarkupVal(graphPath, defaultValue) {      
      let val = this.$parent.getVal(graphPath, defaultValue);
      if (this.roll20Enabled)        
      {
        let roll20Btn = `<span class='dice fo20 pt-2' onclick='fcs.$children[0].$children[0].$children[0].$refs.charactersheet.sendToRoll20("stuntextra", "Stunt", null, "$1")'>C</span> $1`;        
        val = val.replace(/'/g,'').replace(/(.*:.*)/g,`${roll20Btn}`);
      }
      return val;
    },
  }
}
</script>

<style lang="scss" scoped>
  label {
    font-family: 'Archivo Black', sans-serif;
    text-transform: uppercase;
    font-size: 22px;
    font-weight: 700;
  }
</style>
