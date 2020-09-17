<template>
  <div class="m-1 p-1 bg-light border d-flex scene-object" :id="`scene-object-${commonSvc.GetId(objectdata.id)}`"    
    :style="{ position: 'absolute', top: `${objectdata.y}px`, left: `${objectdata.x}px` }">    
    <div class="bg-secondary text-white mr-1 p-1 drag-handle d-flex flex-column align-items-end">
      <i class="fas fa-expand-arrows-alt"></i>
      <button v-if="isFCSObject" :title="`Play ${FCSObjectType}`" @click="openLink()" target="blank" class="p-0 m-0 mt-auto text-white btn btn-link"><i class="fas fa-external-link-alt fa-xs"></i></button>
      <button v-if="isCharacter" :title="`Refresh Data`" @click="syncCharacter()" target="blank" class="p-0 m-0 text-white btn btn-link"><i class="fas fa-sync-alt fa-xs"></i></button>      
    </div>

    <div class="mr-auto w-100">
      <div class="d-flex">
        <div class="d-flex w-100 mr-auto" :class="getBgColor(objectdata)">          
          <editableinput :object="objectdata" item="name" class="font-weight-bold pl-1" />
          <img v-if="objectdata.image_url && !imageEdit" :src="objectdata.image_url" class="rounded-circle portrait" alt="portrait" />          
        </div>
      </div>
      
      <div v-if="imageEdit">
        <label class="control-label">Portrait Url</label><br/>    
        <div class="input-group">
          <input v-model="objectdata.image_url" class="form-control" />
          <div class="input-group-append" style="height: 38px;">
            <button type="button" class="input-group-text" @click="imageEdit = false"><i class="fas fa-check-circle text-success"></i></button>
          </div>
        </div>
        <div>
          <a target="_blank" :href="`https://www.google.com/search?safe=strict&tbm=isch&q=${this.objectdata.name}`" title="Search for image">Search for image</a>
        </div>
      </div>
      
      <div>
        <div class="header d-flex">
          <span class="mr-auto">Aspects</span>
          <i v-if="!isCharacter" title="Add aspect" @click="addThingToObject('aspect')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="objectdata.show.aspects" @click="objectdata.show.aspects=false" title="Hide" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.aspects" @click="objectdata.show.aspects=true" title="Show" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.aspects">
          <div v-for="aspect in sortedAspects" v-bind:key="aspect.id">
            <aspect :aspect="aspect" location="thing" :type="objectdata.object_type" />
          </div>
        </div>
      </div>

      <div v-if="!isCharacter">
        <div class="header d-flex">
          <span class="mr-auto">Skills</span>
          <i title="Add skill" @click="addThingToObject('skill')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="objectdata.show.skills" @click="objectdata.show.skills=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.skills" @click="objectdata.show.skills=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.skills">
          <div v-for="skill in objectdata.skills" v-bind:key="skill.id">
            <skill :skill="skill" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="!isCharacter">
        <div class="header d-flex">
          <span class="mr-auto">Stunts/Extras</span>
          <i title="Add stunt/extra" @click="addThingToObject('stuntextra')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="objectdata.show.stuntextras" @click="objectdata.show.stuntextras=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.stuntextras" @click="objectdata.show.stuntextras=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.stuntextras">
          <div v-for="stuntextra in objectdata.stuntextras" v-bind:key="stuntextra.id">
            <stuntextra :stuntextra="stuntextra" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="!isCharacter">
        <div class="header d-flex">
          <span class="mr-auto">Stress</span>
          <i title="Add stress track" @click="addThingToObject('stress')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="objectdata.show.stress" @click="objectdata.show.stress=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.stress" @click="objectdata.show.stress=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.stress">
          <div v-for="stress in this.objectdata.stress" v-bind:key="stress.id">
            <stress :stress="stress" location="thing"  />
          </div>
        </div>
      </div>

      <div v-if="objectdata.conditions">
        <div class="header d-flex">
          <span class="mr-auto">Conditions</span>
          <i v-if="!isCharacter" title="Add condition" @click="addThingToObject('condition')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="objectdata.show.conditions" @click="objectdata.show.conditions=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.conditions" @click="objectdata.show.conditions=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.conditions">
          <div v-for="condition in this.objectdata.conditions" v-bind:key="condition.id">
            <stress :stress="condition" location="thing" type="CONDITION"  />
          </div>
        </div>
      </div>

      <div v-if="(isCharacter && objectdata.consequences && objectdata.consequences.length > 0) || !isCharacter">
         <div class="header d-flex">
          <span class="mr-auto">Consequences</span>
          <i v-if="!isCharacter" title="Add consequence" @click="addThingToObject('consequence')" class="fas fa-plus-circle fa-sm pt-1"></i>
          <i v-if="objectdata.show.consequences" @click="objectdata.show.consequences=false" class="fas fa-chevron-circle-up fa-sm pt-1"></i>
          <i v-if="!objectdata.show.consequences" @click="objectdata.show.consequences=true" class="fas fa-chevron-circle-down fa-sm pt-1"></i>
        </div>
        <div v-if="objectdata.show.consequences">
          <div v-for="consequence in objectdata.consequences" v-bind:key="consequence.id">
            <consequence :consequence="consequence" location="thing" :type="objectdata.object_type" />
          </div>
        </div>
      </div>

      <div >
        <div class="mt-1 mb-1 separator"></div>
        <aspect :aspect="aspect" v-for="aspect in objectdata.caAndBoost" v-bind:key="aspect.id" />
      </div>
     
    </div>

    <div class="d-flex flex-column bg-light ml-1 border toolbar">
      <button v-if="!objectdata.acted" type="button" class="btn btn-link p-0" title="Has not acted yet" @click="toggleTurn()"><i class="far fa-hourglass text-warning"></i></button>
      <button v-if="objectdata.acted" type="button" class="btn btn-link p-0" title="Has taken an action" @click="toggleTurn()"><i class="fas fa-hourglass text-danger"></i></button>
      <button type="button" class="btn btn-link p-0" title="Create advantage/boost" @click="addThingToObject('caAndBoost')"><i class="fas fa-sticky-note"></i></button>      
      <b-button :id="`move-object-${this.objectdata.id}`" type="button" variant="link" class="btn btn-link p-0" title="Move to Zone"><i class="fas fa-running"></i></b-button>      
      <b-popover ref="popoverZonePicker" :target="`move-object-${this.objectdata.id}`" triggers="click blur">
        <template v-slot:title>Move to Zone</template>
        <select v-model="selectedZone" @change="moveObjectToZone">
          <option v-for="zone in zoneList" :key="zone.id" :value="zone.id">{{zone.name}}</option>
        </select>
      </b-popover>
      <b-button :id="`color-object-${this.objectdata.id}`" type="button" variant="link" class="btn btn-link p-0" title="Change Color"><i class="fas fa-palette"></i></b-button>
      <b-popover ref="popoverColorPicker" :target="`color-object-${this.objectdata.id}`" triggers="click blur">
        <template v-slot:title>Change Color</template>
        <div v-for="color in colorList" :key="color" :value="color"><div class="p-2" style="cursor:pointer;" :class="color" @click="updateObjectColor(color)">&nbsp;</div></div>      
      </b-popover> 
      <button v-if="!isCharacter" type="button" class="btn btn-link p-0" title="Make a copy" @click="copyObject()"><i class="fas fa-copy"></i></button>
      <button type="button" class="btn btn-link p-0" @click="imageEdit = true" title="Edit portrait"><i class="fas fa-image"></i></button>
      <button type="button" class="btn btn-link p-0 mt-auto" title="Remove" @click="removeObject(objectdata.id)"><i class="fas fa-trash-alt"></i></button>
    </div>
  </div>
</template>

<script>
import DbService from '../assets/js/dbService';
import SceneAspect from './scene-aspect';
import SceneStress from './scene-stress';
import SceneStuntExtra from './scene-stuntextra';
import SceneConsequence from './scene-consequence';
import SceneSkill from './scene-skill';
import CommonService from '../assets/js/commonService';
import Models from '../assets/js/models';
import interact from 'interactjs';
import SceneEditableInput from './scene-editable-input';
import bootbox from 'bootbox';

let dbSvc = null;
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
    stuntextra: SceneStuntExtra,
    editableinput: SceneEditableInput,
  },
  created() {  
    dbSvc = new DbService(this.$root);
      
    if (!this.objectdata.x) this.$set(this.objectdata, "x", 40);
    if (!this.objectdata.y) this.$set(this.objectdata, "y", 40);   

    if (!this.objectdata.show) this.$set(this.objectdata, "show", {});
    if (typeof this.objectdata.show.aspects === "undefined") this.$set(this.objectdata.show, "aspects", true);
    if (typeof this.objectdata.show.skills === "undefined") this.$set(this.objectdata.show, "skills", true);
    if (typeof this.objectdata.show.consequences === "undefined") this.$set(this.objectdata.show, "consequences", true);
    if (typeof this.objectdata.show.stress === "undefined") this.$set(this.objectdata.show, "stress", true);
    if (typeof this.objectdata.show.conditions === "undefined") this.$set(this.objectdata.show, "conditions", true);
    if (typeof this.objectdata.show.stuntextras === "undefined") this.$set(this.objectdata.show, "stuntextras", true);
  },
  mounted() {    
    this.init();
  },
  data () {
    return {
      editing: false,     
      imageEdit: false,
      commonSvc: new CommonService(fcs),
      selectedZone: null,
      colorList: [
        "bg-primary", "bg-secondary", "bg-danger text-white", "bg-success", "bg-dark text-white", "bg-warning"
      ]
    }
  },
  computed: {
    sortedAspects() {      
      var sortPriority = [ "trouble", "highconcept" ];
      return this.objectdata.aspects.sort(function(a,b){ 
        if ( a.label == b.label ) return -1;
        return sortPriority.indexOf( b.label ) - sortPriority.indexOf( a.label );
      });
    },
    isFCSObject() {
      return this.objectdata.object_type == "CHARACTER" || this.objectdata.object_type == "ADVERSARY";
    },
    isCharacter() {
      return this.objectdata.object_type == "CHARACTER";
    },
    FCSObjectType() {
      return this.objectdata.object_type;
    },
    zoneList() {       
      var list = this.$parent.$parent.$parent.$data.scene.zones.filter((item) => { return item.id !== this.$parent.$parent.$props.zone.id });
      return list;
    },    
  },
  methods: {   
    init() {
      let dragElemName = `scene-object-${this.commonSvc.GetId(this.objectdata.id)}`;
      let dragElem = document.getElementById(dragElemName);
      let dragElemId = `#${dragElemName}`;
     
      //make it draggable     
      interact(dragElemId)        
        .draggable({
          allowFrom: '.drag-handle',          
          inertia: false,
          modifiers: [
              interact.modifiers.restrictRect({
                  restriction: 'parent'                  
              })
          ],
          // enable autoScroll
          autoScroll: true,
          listeners: { 
            move: (event) => {
              let target = event.target                
              let x = (this.objectdata.x || 0) + event.dx;
              let y = (this.objectdata.y || 0) + event.dy;
                          
              // keep the dragged position in the data-x/data-y attributes
              this.objectdata.x = x;
              this.objectdata.y = y;
            }
          }                     
        }); 
    },
    removeObject(id) {
      bootbox.confirm({
        title: "Delete Object?",
        message: "Are you sure you want to delete this object? This cannot be undone.",
        buttons: {
            confirm: {
              label: 'Yes',
              className: 'btn-danger'
            },
            cancel: {
              label: 'No',
              className: 'btn-secondary'
            }
        },
        callback: (result) => {
          if (result) {
            let $component = this;       
            this.$parent.$parent.$props.zone.sceneobjects = this.$parent.$parent.$props.zone.sceneobjects.filter(function( obj ) {
              return obj.id !== id;
            });
          }
        }
      });      
    },
    moveObjectToZone() {
      //get array
      var sceneObjectIdx = this.$parent.$parent.$props.zone.sceneobjects.findIndex(obj => {
        return obj.id === this.objectdata.id;
      });

      var newZoneIdx = this.$parent.$parent.$parent.$data.scene.zones.findIndex(obj => {
        return obj.id === this.selectedZone;
      });
      
      //add the draggable to the new zone
      this.$parent.$parent.$parent.$data.scene.zones[newZoneIdx].sceneobjects.push(this.objectdata);
      //remove the draggable from the originating zone      
      this.$parent.$parent.$props.zone.sceneobjects.splice(sceneObjectIdx, 1);

      this.selectedZone = null;
    },   
    updateObjectColor(color) {
      this.objectdata.bgcolor = color;
      this.$refs.popoverColorPicker.$emit('close');
    },
    addThingToObject(type) {  
      let objectType = "sceneobject";     
      switch(type) {
        case "caAndBoost":          
          let caAndBoost = models.SceneAspect("CA or Boost","","",true);          
          if (!this.objectdata.caAndBoost) {             
            this.$set(this.objectdata, 'caAndBoost', new Array());
          }
          this.objectdata.caAndBoost.push(caAndBoost);
          break;
        case "aspect":  
          if (!this.objectdata.aspects) { 
            this.$set(this.objectdata, 'aspects', new Array());
          }          
          let aspect = models.SceneAspect("", "", this.objectdata.object_type, Math.max(this.objectdata.sort || 0) + 1);
          this.objectdata.aspects.push(aspect);
          break;
        case "consequence":
          if (!this.objectdata.consequences) { 
            this.$set(this.objectdata, 'consequences', new Array());
          }
          let consequence = models.SceneConsequence("", "-2", "", objectType)           
          this.objectdata.consequences.push(consequence);
          break;
        case "condition":
          if (!this.objectdata.conditions) { 
            this.$set(this.objectdata, 'conditions', new Array());
          }
          let condition = models.SceneCondition("", "", objectType)
          this.objectdata.conditions.push(condition);
          break;
        case "stress":
          if (!this.objectdata.stress) { 
            this.$set(this.objectdata, 'stress', new Array());
          }
          let stress = models.SceneStress("", objectType)           
          this.objectdata.stress.push(stress);
          break
        case "skill":
          if (!this.objectdata.skills) { 
            this.$set(this.objectdata, 'skills', new Array());
          }
          let skill = models.SceneSkill("", "", objectType)           
          this.objectdata.skills.push(skill);
          break;
        case "stuntextra": 
          if (!this.objectdata.stuntextras) { 
            this.$set(this.objectdata, 'stuntextras', new Array());
          }
          let stuntextra = models.SceneStuntExtra("", "", objectType)           
          this.objectdata.stuntextras.push(stuntextra);
          break;
      }
    },  
    copyObject() {      
      let objCopy = Object.assign({}, this.objectdata);
      objCopy.id = this.commonSvc.GenerateUUID();

      let newObj = JSON.parse( JSON.stringify( objCopy ) );
      newObj.x = objCopy.x + 25;
      newObj.y = objCopy.y + 25;
      this.$parent.$parent.$props.zone.sceneobjects.push(newObj);

      this.commonSvc.Notify(`${objCopy.name} was copied.`, "success");
    },
    getBgColor(obj) {      
      if (!obj.bgcolor) {      
        let bgColor = "";       
        switch(obj.object_type) {
          case "ADVERSARY":
            switch(obj.type.toLowerCase()) {
              case "obstacle":
                bgColor = "bg-dark text-white";
                break;
              case "constraint":
                bgColor = "bg-primary";
                break;
              case "other":
                bgColor = "bg-info";
                break;
              default:
                bgColor= "bg-danger text-white";
                break;
            }
          break;

          case "CHARACTER":
            bgColor = "bg-success";
            break;

          default:
            bgColor = "bg-secondary";
            break;
        }      
        this.$set(obj, 'bgcolor', bgColor);
      }

      return obj.bgcolor;
    },  
    openLink() {      
      let data = this.objectdata;
      switch(data.object_type)
      {
        case "CHARACTER":
          window.open(`/${data.object_type.toLowerCase()}/${this.commonSvc.GetId(data.related_id)}/${this.commonSvc.GetId(data.id)}/${this.commonSvc.Slugify(data.name)}`);
          break;
        case "ADVERSARY":
          window.open(`/${data.object_type.toLowerCase()}/${this.commonSvc.GetId(data.originalId)}/${this.commonSvc.Slugify(data.name)}`);
          break;
        default:
          break;
      }
    },
    async syncCharacter() {
      let data = this.objectdata;      
      let character = await dbSvc.GetObject(data.id, data.owner_id);
      
      if (character) {
        let type = "CHARACTER";
        
        //update aspects
        data.aspects = this.$parent.$parent.convertThingToGameObject(character.aspects, type, "ASPECT");
        if (character.consequences) {
          data.consequences = this.$parent.$parent.convertThingToGameObject(character.consequences, type, "CONSEQUENCE");  
        }

        //pull in a new image if one is set
        if (character.image_url) {
          data.image_url = character.image_url;
        }
        /*
        TODO: Implement this. Use dresden sheet as example of complicated implemenation
        if (character.conditions) {
          data.conditions = this.$parent.$parent.convertThingToGameObject(character.conditions, type, "CONDITION");
        }
        */
        this.commonSvc.Notify(`Refreshed data for: ${character.name}.`, "success");
      }
    },
    toggleTurn() {      
      if (typeof this.objectdata.acted === "undefined") {
        this.$set(this.objectdata, "acted", true);
      }
      else {
        this.objectdata.acted = !this.objectdata.acted
      }
    }
  }

}
</script>

<style lang="scss" scoped>  
  .scene-object {
    min-height:150px;
    width: 325px;
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
    object-position: top; /* Center the image within the element */
    width: 100%;
    max-height: 250px;
    margin-bottom: 1rem;
    height: 80px;width: 80px;border: 2px solid black;position: absolute;left: 220px;top: -45px;
  }

  .sheet-link {
    line-height: .8;    
  }
</style>
