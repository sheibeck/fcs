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
    <button v-if="!isCondition" type="button" class="btn btn-link p-0 m-0" title="Add stress box" @click="addStressBox()"><i class="fas fa-plus-square fa-xs"></i></button>    
    <button v-if="!isCondition && stress.boxes.length > 0" type="button" class="btn btn-link p-0 m-0" title="Remove stress box" @click="removeStressBox()"><i class="fas fa-minus-square fa-xs"></i></button>
    <button v-if="!isCondition" class="btn btn-link p-0 m-0 small" type="button"><i title="Remove stress track" @click="removeStressTrack()" class="fas fa-trash-alt fa-xs"></i></button>
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';
import Models from '../assets/js/models';

let models = new Models();

export default {
  name: 'SceneStress',
  props: {
    stress: Object,
    type: String       
  },  
  computed: {
    isCondition() {
      return this.type && this.type.toLowerCase() == "condition";
    }    
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
    },
    addStressBox() {      
      this.stress.boxes.push(models.SceneStressBox());
    },
    removeStressBox() {      
      this.stress.boxes.pop();
    },
    removeStressTrack() {
       this.$parent.objectdata.stress = this.$parent.objectdata.stress.filter( (obj) => {
        return obj.id !== this.stress.id;
      }); 
    }
  }

}
</script>

<style lang="scss" scoped>
  .btn-link {
    line-height: .8;
  }
</style>
