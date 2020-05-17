<template>
  <div class="form-group d-flex">
    <span class="dice fo20 pt-2 pr-3" v-on:click="sendToRoll20('invoke', 'aspect', 'aspects', aspect.obj)">+</span>
    <input type="text" class="form-control" :id="'aspects.' + aspect.obj" :name="'aspects.' + aspect.obj" @change="$parent.setVal(`aspects.${aspect.obj}`,  $event.target.value)" :value="$parent.getVal(`aspects.${aspect.obj}`)" :placeholder="aspect.label" />
  </div>
</template>

<script>

export default {
  name: 'InputAspects',
  props: {
    aspect: Object,    
  },
  computed: {   
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToRoll20() {      
      let label = `aspect ${this.aspect.label}`;
      this.$parent.sendToRoll20('invoke', label, "aspects", this.aspect.obj);
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
</style>
