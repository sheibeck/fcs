<template>
  <div class="m-1 p-1 bg-light border d-flex" :id="`SCENEOBJECT|${objectdata.domId}`">
    <div class="bg-secondary text-white mr-1 p-1 objectHandle">
      <i class="fas fa-bars"></i>
    </div>

    <div class="mr-auto w-100">      
     
        <div class="w-100" :class="getBgForType(objectdata.type)">
          <strong class="px-1">{{objectdata.name}}</strong>    
        </div>      
        
        <div>        
          Aspects<br/>          
        </div>
        <div>
          Stress [] [] []
        </div>
     
    </div>

    <div class="d-flex flex-column bg-light ml-1 border">
      <button type="button" class="btn btn-link p-0" title="Add Aspect" @click="addThingToObject('aspect')"><i class="fas fa-sticky-note"></i></button>      
      <button type="button" class="btn btn-link p-0" @click="editObject(objectdata.domId)"><i class="fas fa-plus-circle"></i></button>      
      <button type="button" class="btn btn-link p-0" @click="removeObject(objectdata.domId)"><i class="fas fa-trash-alt"></i></button>
    </div>
  </div>
</template>

<script>
import SceneAspect from './scene-aspect';
export default {
  name: 'SceneObject',
  props: {
    objectdata: Object,
  },
  components: {
    aspect: SceneAspect
  },
  created() {    
  },
  computed: {    
  },
  data () {
    return {      
    }
  },
  methods: {
    getBgForType(type) {
      switch(type) {
        case "ADVERSARY":
          return "bg-danger";
        case "CHARACTER":
          return "bg-success";        
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
