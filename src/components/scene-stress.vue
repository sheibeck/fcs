<template>
  <div class="pl-1 ml-1 d-flex">
    <editableinput :object="stress" item="name" class="mr-2 font-weight-bold small" />

    <div v-for="box in stress.boxes" v-bind:key="box.id" class="d-flex">      
      <editableinput v-if="typeof box.label == 'string'" :object="box" item="label" class="small" />
      <input type="checkbox" :checked="box.used" @change="toggleStress($event, box.id)" class="mr-1 mt-1" />      
    </div>
    <button v-if="!isCondition" type="button" class="btn btn-link p-0 m-0" title="Add stress box" @click="addStressBox()"><i class="fas fa-plus-square fa-xs"></i></button>    
    <button v-if="!isCondition && stress.boxes.length > 0" type="button" class="btn btn-link p-0 m-0" title="Remove stress box" @click="removeStressBox()"><i class="fas fa-minus-square fa-xs"></i></button>
    <button v-if="!isCondition" class="btn btn-link p-0 m-0 small" type="button"><i title="Remove stress track" @click="removeStressTrack()" class="fas fa-trash-alt fa-xs"></i></button>
  </div>
</template>

<script>
import CommonService from '../assets/js/commonService';
import Models from '../assets/js/models';
import SceneEditableInput from './scene-editable-input';

let models = new Models();

export default {
  name: 'SceneStress',
  props: {
    stress: Object,
    type: String       
  },  
  components: {    
    editableinput: SceneEditableInput, 
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
      let box = models.SceneStressBox();
      box.label = "1";
      this.stress.boxes.push(box);
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
