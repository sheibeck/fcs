<template>
  <div class="m-1 p-1 bg-light border d-flex" :id="objectdata.domId">
    <div class="bg-secondary text-white mr-1 p-1 objectHandle">
      <i class="fas fa-bars"></i>
    </div>

    <div class="mr-auto w-100">          
      <div class="w-100" :class="getBgForType(objectdata)">
        <strong class="px-1">{{objectdata.name}}</strong>
      </div>      
      
      <div>
        <div>Aspects</div>
        <div v-for="aspect in objectdata.aspects" v-bind:key="aspect.id">
          <aspect :aspect="aspect" location="thing"  />
        </div>
      </div>

      <div>
        Stress [] [] []
      </div>

      <div >
        <div class="mt-1 mb-1 separator"></div>
        <aspect :aspect="aspect" v-for="aspect in objectdata.caAndBoost" v-bind:key="aspect.id" />
      </div>
     
    </div>

    <div class="d-flex flex-column bg-light ml-1 border">
      <button type="button" class="btn btn-link p-0" title="Add Aspect" @click="addThingToObject('aspect')"><i class="fas fa-sticky-note"></i></button>            
      <button type="button" class="btn btn-link p-0" title="Remove" @click="removeObject(objectdata.id)"><i class="fas fa-trash-alt"></i></button>
    </div>
  </div>
</template>

<script>
import SceneAspect from './scene-aspect';
import CommonService from '../assets/js/commonService';

let commonSvc = null;

export default {
  name: 'SceneObject',
  props: {
    objectdata: Object,
  },
  components: {
    aspect: SceneAspect
  },
  created() { 
    commonSvc = new CommonService(this.$root);   
  },
  computed: {    
  },
  data () {
    return {      
    }
  },
  methods: {
    removeObject(id) {
      let $component = this;       
      this.$parent.$parent.$parent.$parent.$props.zone.sceneobjects = this.$parent.$parent.$parent.$parent.$props.zone.sceneobjects.filter(function( obj ) {
        return obj.id !== id;
      });
    },
    addThingToObject(type) {       
      switch(type) {
        case "aspect":
          let aspect = {id:commonSvc.GenerateUUID(), name: "Aspect Name", editing: true, invokes: [{id:commonSvc.GenerateUUID(), used: false}]};
          if (!this.objectdata.caAndBoost) {             
            this.$set(this.objectdata, 'caAndBoost', new Array());
          }
          this.objectdata.caAndBoost.push(aspect);
          break;
      }
    },
    getBgForType(obj) {
      
      switch(obj.object_type) {
        case "ADVERSARY":
          switch(obj.type.toLowerCase()) {
            case "obstacle":
              return "bg-dark text-white";
            case "constraint":
              return "bg-primary";
            case "other":
              return "bg-info";
            default:
              return "bg-danger text-white";
          }
        case "CHARACTER":
          return "bg-success";        
      }
    }
  }

}
</script>

<style lang="scss" scoped>
  .objectHandle {
    cursor:grab;
  }

  .separator {
    border-top: solid 1px #ccc; border-width: thin;
  }
</style>
