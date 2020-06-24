<template>
  <div class="pl-1 ml-1">
    <span title="Click to edit" v-if="!editing" @click="editing = true">{{stress.name.toTitleCase()}}</span>

    <div class="input-group" v-if="editing">  
      <input class="form-control-sm" v-model="stress.name"  />
      <div class="input-group-append">
          <button type="button" class="input-group-text" @click="editing = false"><i class="fas fa-check-circle text-success"></i></button>
      </div>
    </div>

    <span v-for="box in stress.boxes" v-bind:key="box.id">
      <label v-if="typeof box.label == 'string'">{{box.label.toTitleCase()}}</label><input type="checkbox" :checked="box.used" @change="toggleStress($event, box.id)" class="mr-1" />
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
      editing: false,
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
