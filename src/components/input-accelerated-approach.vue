<template>
  <div class="form-group d-flex">
      <span v-if="hasRoll20" class="dice fo20 pt-2" v-on:click="sendToRoll20()">+</span>
      <label v-if="!item.label" class="p-1 mr-auto">{{item.placeholder}}</label>      
     	<input v-if="item.label" class="form-control approachlabel" type="text" :id="`approaches.${item.label}`" :name="`approaches.${item.label}`" 
        @change="$parent.setVal(`approaches.${item.label}`,  $event.target.value)" 
        :value="$parent.getVal(`approaches.${item.label}`)" :placeholder="item.placeholder" />
       
      <input class="form-control text-center w-25" type="text" :id="item.obj" :name="item.obj" 
        @change="$parent.setVal(`approaches.${item.obj}`,  $event.target.value)" 
        :value="$parent.getVal(`approaches.${item.obj}`)" placeholder="+">			  
    </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  name: 'InputAcceleratedApproach',
  props: {
    item: Object,    
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
    sendToRoll20() {      
      if (!this.item.obj) return;      
      let label = `approach ${this.item.label ? this.$parent.getVal(`approaches.${this.item.label}`) : this.item.placeholder}`;
      this.$parent.sendToRoll20('diceroll', label, "approaches", this.item.obj);
    }
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
  
  input.approachlabel {
		font-family: 'Archivo Black', sans-serif;
		text-transform: uppercase;
		font-size: 22px;
		font-weight: 700;
		border: 0;
		outline: 0;
		background: transparent;
		border-bottom: 1px solid lightgray;
	}
</style>
