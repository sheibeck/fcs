<template>
  <div class="pl-1 ml-1">
    <span title="Click to edit" v-if="!stress.editing" @click="stress.editing = true">{{stress.name}}</span>

    <div class="input-group" v-if="stress.editing">  
      <input class="form-control-sm" v-model="stress.name"  />
      <div class="input-group-append">              
          <button type="button" class="input-group-text" @click="stress.editing = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>
    </div>

    <span v-for="box in stress.boxes" v-bind:key="box.id">
      <label>{{box.label}}</label><input type="checkbox" :checked="box.used" @change="toggleStress($event, box.id)" class="mr-1" />
    </span>   
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';

export default {
  name: 'SceneStress',
  props: {
    stress: Object,       
  },  
  computed: {    
  },
  data () {
    return { 
      commonSvc: new CommonService(),
    }
  },
  methods: {   
    toggleStress(event, id) {      
      let idx = this.stress.boxes.findIndex(x => x.id === id);
      this.stress.boxes[idx].used = event.target.checked;
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
