<template>
	<div class="form-group d-flex">
    <span class="dice fo20 pt-1 pr-3" v-on:click="sendToRoll20('invoke', 'consequence', 'consequences', consequence.obj)">+</span>
    <label class="pr-3 mr-auto">{{consequence.value}}</label>
    <input type="text" class="form-control" :id="'consequences.' + consequence.obj" :name="'consequences.' + consequence.obj" @change="$parent.setVal(`consequences.${consequence.obj}`,  $event.target.value)" :value="$parent.getVal(`consequences.${consequence.obj}`)" :placeholder="consequence.label" />
  </div>
</template>

<script>

export default {
  name: 'InputConsequence',
  props: {
    consequence: Object,    
  },
  computed: {   
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToRoll20() {      
      let label = `consequence ${this.consequence.label}`;
      this.$parent.sendToRoll20('invoke', label, "consequences", this.consequence.obj);
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
