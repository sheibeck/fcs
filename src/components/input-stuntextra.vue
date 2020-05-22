<template>
  <div>
    <div for="stunts" class="fate-header d-flex">
      <span class="mr-auto">{{header}}</span>
      <a v-on:click="stuntEdit = !stuntEdit">
        <i class="fas d-print-none pr-2" :class="{ 'fa-check-circle' : stuntEdit, 'fa-edit' : !stuntEdit }"></i>
      </a>
    </div>

    <div class="form-group">    
      <textarea v-if="stuntEdit" class="form-control" id="stunts" name="stunts" :rows="rows" placeholder="Stunts &amp; Extras" @change="$parent.setVal(item,  $event.target.value)" :value="$parent.getVal(item)"></textarea>
      <VueShowdown v-if="!stuntEdit" class="h-auto p-2" :class="{border: border}" :options="{ emoji: true }" :style="{ 'min-height': minHeight + 'px' }" :markdown="getMarkupVal(item)" />
    </div>  
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
    rows: Number,
    border: Boolean,
    header: String,
  },
  computed: {
 	  ...mapGetters([
      'isAuthenticated',
      'roll20Enabled'
    ]),
    hasRoll20() {
      return this.isAuthenticated && this.roll20Enabled;
    },
    minHeight() {
      return this.rows * 28;
    }
  },
  data () {
    return {  
      stuntEdit: false,    
    }
  },
  methods: {
    getMarkupVal(graphPath, defaultValue) {      
      let val = this.$parent.getVal(graphPath, defaultValue);
      if (this.roll20Enabled)        
      {
        let roll20Btn = `<span class='dice fo20' onclick='fcs.$children[0].$children[0].$children[0].$refs.charactersheet.sendToRoll20("stuntextra", "Stunt", null, "$1")'>C</span> $1`;        
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

  	.fate-header {
		font-family: 'Archivo Black', sans-serif;
		text-transform: uppercase;
		background-color: #000;
		color: white;
		font-weight: 700;
		padding: 3px;
		margin-top: 5px;
		font-size: 22px;
	}
</style>
