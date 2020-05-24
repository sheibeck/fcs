<template>
  <div class="form-group">    
    <div v-if="showlabel">
      <label v-if="showlabel">{{aspect.label}}</label>
    </div>
    <div class="d-flex">
      <span v-if="hasRoll20" class="dice fo20 pt-2 pr-1" v-on:click="sendToRoll20('invoke', 'aspect', 'aspects', aspect.obj)">C</span>      
      <input type="text" class="form-control" :id="aspect.obj" :name="'aspects.' + aspect.obj" @change="$parent.setVal(aspect.obj,  $event.target.value)" :value="$parent.getVal(aspect.obj)" :placeholder="aspect.label" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InputAspects',
  props: {
    aspect: Object,    
    showlabel: Boolean,
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
      if (!this.aspect || !this.aspect.label) return;   
      let label = `aspect ${this.aspect.label}`;
      this.$parent.sendToRoll20('invoke', label, "aspects", this.aspect.obj);
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
