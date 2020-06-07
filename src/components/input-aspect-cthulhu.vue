<template>
  <div class="form-group">    
    <div class="d-flex mr-1">
      <label class="mr-auto">{{aspect.label}}</label>
      <label>Corrupted?</label>
    </div>
    <div class="d-flex mr-4">
      <span v-if="hasRoll20" class="dice fo20 pt-2 pr-1" v-on:click="sendToRoll20('invoke', 'aspect', 'aspects', aspect.obj)">C</span>      
      <input type="text" class="form-control mr-4" :id="aspect.obj" :name="aspect.obj" @change="$parent.setVal(aspect.obj,  $event.target.value)" :value="$parent.getVal(aspect.obj)" :placeholder="aspect.label" />
      <div>        
        <input type="checkbox" class="form-control corrupted-checkbox" value="1" :id="aspect.corrupted_obj" :name="aspect.corrupted_obj" @change="$parent.setVal(aspect.corrupted_obj,  $event.target.checked)" :checked="$parent.getVal(aspect.corrupted_obj)"  />
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'InputAspects',
  props: {
    aspect: Object,   
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
