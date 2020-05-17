<template>
  <div class="form-group d-flex">
      <span class="dice fo20 pt-2" v-on:click="sendToRoll20()">+</span>
      <label class="p-1 mr-auto">{{this.itemname}}</label>
      <input class="form-control text-center w-25" type="text" :id="this.itemname" :name="this.itemname" 
        @change="this.$parent.setVal(`approaches.${this.itemname}`,  $event.target.value)" 
        :value="this.$parent.getVal(`approaches.${this.itemname}`)" placeholder="+">			  
    </div>
</template>

<script>

export default {
  name: 'InputAcceleratedApproach',
  props: {
    itemname: String,    
  },
  computed: {   
  },
  data () {
    return {
    }
  },
  methods: { 
    sendToRoll20() {      
      let label = `approach ${this.itemname.toTitleCase()}`;
      this.$parent.sendToRoll20('diceroll', label, "approaches", this.itemname);
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
