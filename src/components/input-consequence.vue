<template>
	<div class="form-group d-flex">
    <span class="dice fo20 pt-1 pr-3" v-on:click="sendToRoll20('invoke', 'consequence', 'consequences', consequence.obj)">+</span>
    <label class="pr-3 mr-auto">{{consequence.value}}</label>
    <input type="text" class="form-control" :id="'consequences.' + consequence.obj" :name="'consequences.' + consequence.obj" @change="setVal(`consequences.${consequence.obj}`,  $event.target.value)" :value="$parent.getVal(`consequences.${consequence.obj}`)" :placeholder="consequence.label" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InputConsequence',
  props: {
    consequence: Object,    
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
      let label = `consequence ${this.consequence.label}`;
      this.$parent.sendToRoll20('invoke', label, "consequences", this.consequence.obj);
    },
    setVal(arr, val) {       
      if (this.roll20Enabled) {
        this.$parent.sendToRoll20("consequence", this.consequence.label, arr, val);
        this.$parent.setVal(arr, val);
        this.$parent.$parent.$parent.save();
      } 
      else {
        this.$parent.setVal(arr, val);
      }
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
