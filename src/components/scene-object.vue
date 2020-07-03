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
          <button v-if="objectdata.object_type" @click="openLink()" target="blank" class="p-0 text-white pr-1 mr-auto btn btn-link"><i class="fas fa-link fa-xs"></i></button>
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
          <i v-if="show.aspects" @click="show.aspects=false" title="Hide" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!show.aspects" @click="show.aspects=true" title="Show" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="show.aspects">
          <div v-for="aspect in objectdata.aspects" v-bind:key="aspect.id">
            <aspect :aspect="aspect" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.object_type != 'CHARACTER'">
        <div class="header d-flex">
          <span class="mr-auto">Skills</span>          
          <i title="Add skill" @click="addThingToObject('skill')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="show.skills" @click="show.skills=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!show.skills" @click="show.skills=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="show.skills">
          <div v-for="skill in objectdata.skills" v-bind:key="skill.id">
            <skill :skill="skill" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.object_type != 'CHARACTER'">
        <div class="header d-flex">
          <span class="mr-auto">Stress</span>
          <i title="Add stress" @click="addThingToObject('stress')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="show.stress" @click="show.stress=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!show.stress" @click="show.stress=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="show.stress">
          <div v-for="stress in this.objectdata.stress" v-bind:key="stress.id">
            <stress :stress="stress" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.conditions && objectdata.object_type != 'CHARACTER'">
        <div class="header d-flex">
          <span class="mr-auto">Conditions</span>
          <i title="Add condition" @click="addThingToObject('condition')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="show.conditions" @click="show.conditions=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!show.conditions" @click="show.conditions=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="show.conditions">
          <div v-for="condition in this.objectdata.conditions" v-bind:key="condition.id">
            <stress :stress="condition" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.consequences && objectdata.object_type != 'CHARACTER'">
         <div class="header d-flex">
          <span class="mr-auto">Consequences</span>
          <i title="Add consequence" @click="addThingToObject('consequence')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="show.consequences" @click="show.consequences=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!show.consequences" @click="show.consequences=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="show.consequences">
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
      <button type="button" class="btn btn-link p-0" title="Attach an aspect" @click="addThingToObject('aspect')"><i class="fas fa-sticky-note"></i></button>
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
import SceneSkill from './scene-skill';
import CommonService from '../assets/js/commonService';
import Models from '../assets/js/models';

let models = new Models();

export default {
  name: 'SceneObject',
  props: {
    objectdata: Object,
  },
  components: {
    aspect: SceneAspect,
    stress: SceneStress,
    consequence: SceneConsequence,
    skill: SceneSkill,
  },      
  data () {
    return {
      editing: false,
      show: {
        aspects: true,
        skills: true,
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
      let objectType = "sceneobject";     
      switch(type) {
        case "aspect":
          let aspect = models.SceneAspect("","",objectType,true);          
          if (!this.objectdata.caAndBoost) {             
            this.$set(this.objectdata, 'caAndBoost', new Array());
          }
          this.objectdata.caAndBoost.push(aspect);
          break;
        case "consequence":
          let consequence = models.SceneConsequence("", "", "", objectType)           
          this.objectdata.consequences.push(consequence);
          break;
        case "condition":
          let condition = models.SceneCondition("", "", objectType)
          this.objectdata.conditions.push(condition);
          break;
        case "stress":        
          let stress = models.SceneStress("", objectType)           
          this.objectdata.stress.push(stress);
          break
        case "skill":          
          let skill = models.SceneSkill("", "", objectType)           
          this.objectdata.skills.push(skill);
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
        default:
          return "bg-secondary";
      }
    },  
    openLink() {      
      let data = this.objectdata;
      switch(data.object_type)
      {
        case "CHARACTER":
          window.open(`/${data.object_type.toLowerCase()}/${this.commonSvc.GetId(data.related_id)}/${this.commonSvc.GetId(data.id)}/${data.slug}`);
          break;
        case "ADVERSARY":
          window.open(`/${data.object_type.toLowerCase()}/${this.commonSvc.GetId(data.originalId)}/${data.slug}`);
          break;
        default:
          break;
      }
    }
  }

}
</script>

<style lang="scss" scoped>
  .objectHandle {
    cursor:grab;
  }

  .fas {
    cursor: pointer;
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
