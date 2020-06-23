<template>
  <div class="m-1 p-1 bg-light border d-flex" :id="`scene-object-${commonSvc.GetId(objectdata.id)}`">
    <div class="bg-secondary text-white mr-1 p-1 objectHandle">
      <i class="fas fa-bars"></i>
    </div>

    <div class="mr-auto w-100">
      <div class="w-100 d-flex" :class="getBgForType(objectdata)">              
        <div class="mr-auto">
          <strong title="Click to edit" class="px-1" v-if="!editing" @click="editing=true">{{objectdata.name}}</strong>
          <div class="input-group" v-if="editing">  
            <input class="form-control-sm" v-model="objectdata.name" />
            <div class="input-group-append">              
                <button type="button" class="input-group-text" @click="editing=false"><i class="fas fa-check-circle text-success"></i></button>
            </div>
          </div>
        </div>        
        <a v-if="objectdata.object_type" :href="getLink()" target="blank" class="text-white pr-1"><i class="fas fa-link"></i></a>        
      </div>
      
      <div>
        <div class="header">Aspects</div>
        <div v-for="aspect in objectdata.aspects" v-bind:key="aspect.id">
          <aspect :aspect="aspect" location="thing"  />
        </div>
      </div>

      <div>
        <div class="header">Stress</div>
        <div v-for="stress in objectdata.stress" v-bind:key="stress.constructor.name">
          <stress :stress="stress" location="thing"  />
        </div>
      </div>

      <div>
        <div class="header">Consequence</div>
        <div v-for="consequence in objectdata.consequences" v-bind:key="consequence.constructor.name">
          <consequence :consequence="consequence" location="thing"  />
        </div>
      </div>

      <div >
        <div class="mt-1 mb-1 separator"></div>
        <aspect :aspect="aspect" v-for="aspect in objectdata.caAndBoost" v-bind:key="aspect.id" />
      </div>
     
    </div>

    <div class="d-flex flex-column bg-light ml-1 border toolbar">
      <button type="button" class="btn btn-link p-0" title="Add Aspect" @click="addThingToObject('aspect')"><i class="fas fa-sticky-note"></i></button>
      <button v-if="objectdata.object_type != 'CHARACTER'" type="button" class="btn btn-link p-0" title="Make a copy" @click="copyObject()"><i class="fas fa-copy"></i></button>
      <button type="button" class="btn btn-link p-0" title="Remove" @click="removeObject(objectdata.id)"><i class="fas fa-trash-alt"></i></button>
    </div>
  </div>
</template>

<script>
import SceneAspect from './scene-aspect';
import SceneStress from './scene-stress';
import SceneConsequence from './scene-consequence';
import CommonService from '../assets/js/commonService';

export default {
  name: 'SceneObject',
  props: {
    objectdata: Object,
  },
  components: {
    aspect: SceneAspect,
    stress: SceneStress,
    consequence: SceneConsequence,
  },    
  data () {
    return {
      editing: false,
      commonSvc: new CommonService(fcs),      
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
          let aspect = {id:this.commonSvc.GenerateUUID(), name: "Aspect Name", editing: true, invokes: [{id:this.commonSvc.GenerateUUID(), used: false}]};
          if (!this.objectdata.caAndBoost) {             
            this.$set(this.objectdata, 'caAndBoost', new Array());
          }
          this.objectdata.caAndBoost.push(aspect);
          break;
      }
    },  
    copyObject() {
      let objCopy = Object.assign({}, this.objectdata);
      objCopy.id = this.commonSvc.GenerateUUID();      
      this.$parent.$parent.$parent.$parent.$props.zone.sceneobjects.push(objCopy);
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
    },
    getLink() {
      let data = this.objectdata;
      switch(data.object_type)
      {
        case "CHARACTER":
          return `/${data.object_type.toLowerCase()}/${this.commonSvc.GetId(data.related_id)}/${this.commonSvc.GetId(data.id)}/${data.slug}`;
        case "ADVERSARY":
          return `/${data.object_type.toLowerCase()}/${this.commonSvc.GetId(data.originalId)}/${data.slug}`;
        default:
          return "";
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

  .header {
    font-style: italic;
    border-bottom: solid 1px #ccc;
  }
</style>
