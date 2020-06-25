<template>
  <div class="m-1 p-1 bg-light border d-flex" :id="`scene-object-${commonSvc.GetId(objectdata.id)}`">
    <div class="bg-secondary text-white mr-1 p-1 objectHandle">
      <i class="fas fa-bars"></i>
    </div>

    <div class="mr-auto w-100">
      <div class="d-flex">
        <div class="d-flex w-100 mr-auto" :class="getBgForType(objectdata)">
          <div>
            <strong title="Click to edit" class="px-1" v-if="!editing" @click="editing=true">{{objectdata.name}}</strong>
            <div class="input-group" v-if="editing">  
              <input class="form-control-sm" v-model="objectdata.name" />
              <div class="input-group-append">              
                  <button type="button" class="input-group-text" @click="editing=false"><i class="fas fa-check-circle text-success"></i></button>
              </div>
            </div>
          </div>                
          <a v-if="objectdata.object_type" :href="getLink()" target="blank" class="text-white pr-1 mr-auto"><i class="fas fa-link fa-xs"></i></a>                    
        </div>        
      </div>      
      
      <!-- editor -->
      <div v-if="objectdata.image_url && !imageEdit" class="w-100 pr-2 text-right" style="margin-top: -25px;margin-bottom: -25px;">
        <img :src="objectdata.image_url" style="height: 80px; width: 80px; border: solid 2px black;" class="rounded-circle portrait" alt="portrait" />
      </div>      

      <div v-if="imageEdit">
        <label class="control-label">Portrait Url</label><br/>    
        <div class="input-group">
          <input v-model="objectdata.image_url" class="form-control" />
          <div class="input-group-append" style="height: 38px;">
            <button type="button" class="input-group-text" @click="imageEdit = false"><i class="fas fa-check-circle text-success"></i></button>
          </div>
        </div>
      </div>
      <!-- drag handle -->

      <div>
        <div class="header d-flex">
          <span class="mr-auto">Aspects</span>
          <i v-if="objectdata.show.aspects" @click="objectdata.show.aspects=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.aspects" @click="objectdata.show.aspects=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.aspects">
          <div v-for="aspect in objectdata.aspects" v-bind:key="aspect.id">
            <aspect :aspect="aspect" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.object_type != 'CHARACTER'">
        <div class="header d-flex">
          <span class="mr-auto">Stress</span>
          <i v-if="objectdata.show.stress" @click="objectdata.show.stress=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.stress" @click="objectdata.show.stress=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.stress">
          <div v-for="stress in this.objectdata.stress" v-bind:key="stress.id">
            <stress :stress="stress" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.conditions && objectdata.object_type != 'CHARACTER'">
        <div class="header d-flex">
          <span class="mr-auto">Conditions</span>
          <i v-if="objectdata.show.conditions" @click="objectdata.show.conditions=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.conditions" @click="objectdata.show.conditions=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.conditions">
          <div v-for="condition in this.objectdata.conditions" v-bind:key="condition.id">
            <stress :stress="condition" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.consequences">
         <div class="header d-flex">
          <span class="mr-auto">Consequences</span>
          <i v-if="objectdata.show.consequences" @click="objectdata.show.consequences=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.consequences" @click="objectdata.show.consequences=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.consequences">
          <div v-for="consequence in objectdata.consequences" v-bind:key="consequence.id">
            <consequence :consequence="consequence" location="thing"  />
          </div>
        </div>
      </div>

      <div >
        <div class="mt-1 mb-1 separator"></div>
        <aspect :aspect="aspect" v-for="aspect in objectdata.caAndBoost" v-bind:key="aspect.id" />
      </div>
     
    </div>

    <div class="d-flex flex-column bg-light ml-1 border toolbar">
      <button type="button" class="btn btn-link p-0" title="Add Aspect" @click="addThingToObject('aspect')"><i class="fas fa-sticky-note"></i></button>
      <button type="button" class="btn btn-link p-0" @click="imageEdit = true" title="Edit portrait"><i class="fas fa-image"></i></button>
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
      show: {
        aspects: true,
        stress: true,
        consequences: true,
      },
      imageEdit: false,
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

  .portrait {
    object-fit: cover ; /* Do not scale the image */
    object-position: center; /* Center the image within the element */
    width: 100%;
    max-height: 250px;
    margin-bottom: 1rem;
  }
</style>
