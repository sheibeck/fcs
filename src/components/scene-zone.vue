<template>  
  <vue-draggable-resizable :id="`zone-${commonSvc.GetId(zone.id)}`" class="p-1 m-1 d-flex border bg-white zone draggable-item" 
        drag-handle=".zoneHandle" :parent="true" :drag-cancel="'.cancelZoneDrag'"  :x="zone.x" :y="zone.y"
        :w="zone.width" :h="zone.height" @dragging="onDrag" @resizing="onResize" :style="`z-index:${this.zone.zindex};`">
    
    <!-- zone background image and editor -->
    <img v-if="zone.backgroundImage && !zoneImageEdit" :src="zone.backgroundImage" class="img-fluid zone-image" />
    
    <div v-if="zoneImageEdit">      
      <label class="control-label">Zone Image Url</label><br/>    
      <div class="input-group">      
        <input v-model="zone.backgroundImage" class="form-control" />
        <div class="input-group-append" style="height: 38px;">
          <button type="button" class="input-group-text" @click="toggleZoneImageEdit()"><i class="fas fa-check-circle text-success"></i></button>
        </div>
      </div>
    </div>
    <!-- drag handle -->
    <i class="fas fa-expand-arrows-alt p-1 mr-1 bg-dark text-white zoneHandle"></i>

    <!-- details -->
    <div class="mr-auto cancelZoneDrag">
      <header>
        <!-- name -->        
        <label title="Click to edit" v-if="!editing" @click="editing=true" style="vertical-align: top;">{{zone.name.toUpperCase()}}</label>
        <div class="input-group" v-if="editing">  
          <input class="form-control-sm" v-model="zone.name" />
          <div class="input-group-append">              
              <button type="button" class="input-group-text" @click="editing=false"><i class="fas fa-check-circle text-success"></i></button>
          </div>
        </div>

        <span v-if="zone.aspects.length" style="vertical-align: top;">&mdash; <em>Aspects</em></span>        
        <zoneaspect :aspect="aspect" location="zone" v-for="aspect in zone.aspects" v-bind:key="aspect.id" />
      </header>

      <Container :id="`drag-container-${commonSvc.GetId(zone.id)}`" style="min-height:150px;"
        group-name="zone" 
        :get-ghost-parent="getGhostParent" 
        :get-child-payload="getChildPayload"
        @drag-enter="onDragEnter" 
        @drag-end="onDragEnd"               
        drag-handle-selector=".objectHandle"  
        @drop="onZoneDrop(commonSvc.GetId(zone.id), $event)"
        drag-class="card-ghost" 
        drop-class="card-ghost-drop" 
        :drop-placeholder="dropPlaceholderOptions">            
        <Draggable style="min-height:150px;" v-for="item in zone.sceneobjects" :key="item.id">
          <sceneobject :objectdata="item" />
        </Draggable>
      </Container>      
    </div>

    <div class="d-flex flex-column bg-light pl-1">
      <button type="button" class="btn btn-link p-0" title="Add Zone Aspect" @click="addZoneObject('aspect')"><i class="fas fa-sticky-note"></i></button>    
      <b-button :id="`add-character-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add Character" @click="addZoneObject('character')"><i class="fas fa-user-circle"></i></b-button>  
      <b-popover ref="popoverCharacter" :target="`add-character-${this.zone.id}`" triggers="click blur">
        <template v-slot:title>Add Character</template>
        <autocomplete :search="searchCharacters"
          placeholder="Search Characters"
          aria-label="Search Characters"
          :get-result-value="getCharacterResultValue"
          @submit="selectCharacterResult">
           <template #result="{ result, props }">
          <li v-bind="props">
            <div class="p-0 m-0 h6">
              {{result.name}}
            </div>
            <div class="small p-0 m-0">
              <div v-if="result.aspects">                           
                <div v-if="result.aspects.highconcept"><label class="p-0 m-0">HC:</label> {{result.aspects.highconcept||""}}</div>
                <div v-if="result.aspects.trouble"><label class="p-0 m-0">T:</label> {{result.aspects.trouble||""}}</div>
              </div>
              <div><label class="p-0 m-0">Sheet:</label> {{result.related_id.replace("CHARACTERSHEET|", "")}}</div>
            </div>
          </li>
        </template></autocomplete>
      </b-popover>
      <b-button :id="`add-adversary-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add Adversary"><i class="fas fa-theater-masks"></i></b-button>
      <b-popover ref="popoverAdversary" :target="`add-adversary-${this.zone.id}`" triggers="click blur">
        <template v-slot:title>Add Adversary</template>
        <autocomplete :search="searchAdversaries"
          placeholder="Search Adversaries"
          aria-label="Search Adversaries"
          :get-result-value="getAdversaryResultValue"
          @submit="selectAdversaryResult">
          <template #result="{ result, props }">
          <li v-bind="props">
            <div class="p-0 m-0 h6">
              {{result.name}}
            </div>
            <div class="small p-0 m-0">
              <div v-if="result.aspects">  
                <div v-if="result.aspects.high_concept"><label class="p-0 m-0">HC:</label> {{result.aspects.high_concept||""}}</div>
                <div v-if="result.aspects.trouble"><label class="p-0 m-0">T:</label> {{result.aspects.trouble||""}}</div>
              </div>
              <div><label class="p-0 m-0">Type:</label> {{result.type||"Unknown"}}</div>
            </div>
          </li>
        </template></autocomplete>
      </b-popover>
      <b-button :id="`add-npc-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add NPC" @click="addNPC()"><i class="fas fa-users"></i></b-button>
      <button type="button" class="btn btn-link p-0" @click="toggleZoneImageEdit()" title="Edit zone image"><i class="fas fa-image"></i></button>
      <hr />
      <button type="button" class="btn btn-link p-0" @click="moveForward()" title="Move zone forward"><i class="fas fa-chevron-circle-up"></i></button>
      <button type="button" class="btn btn-link p-0" @click="moveBackward()" title="Move zone backward"><i class="fas fa-chevron-circle-down"></i></button>
      <button type="button" class="btn btn-link p-0" @click="removeZone()" title="Delete zone"><i class="fas fa-trash-alt"></i></button>      
    </div>  
  </vue-draggable-resizable>
</template>

<script>
import SceneObject from './scene-object';
import SceneAspect from './scene-aspect';
import draggable from 'vuedraggable';
import VueDraggableResizable from 'vue-draggable-resizable';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';
import { Container, Draggable } from "vue-smooth-dnd";
import CommonService from '../assets/js/commonService';
import Autocomplete from '@trevoreyre/autocomplete-vue'
import DbService from '../assets/js/dbService';
import Models from '../assets/js/models';

let dbSvc = null;
let models = new Models();

export default {
  name: 'SceneObject',
  props: {
    zone: Object,
  },  
  components: {   
    draggable, 
    'vue-draggable-resizable': VueDraggableResizable,
    sceneobject: SceneObject,
    zoneaspect: SceneAspect,
    Container,
    Draggable,
    Autocomplete
  },  
  created() {    
    dbSvc = new DbService(this.$root);
    this.init();
  },
  computed: {
    hasZoneImage() {
      return this.zone.backgroundImage;
    }
  }, 
  data () {
    return {
      commonSvc: new CommonService(fcs),
      editing: false,
      loading: true,     
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '150',
        showOnTop: true
      },
      zoneImageEdit: false,                  
    }
  },
  methods: {
    init() {         
    },    
    makeGameObject(result, type) {
      if (!result) return;
            
      result.aspects = this.convertThingToGameObject(result.aspects, type, "ASPECT");
      result.consequences = this.convertThingToGameObject(result.consequences, type, "CONSEQUENCE");      
      result.stress = this.convertThingToGameObject(result.stress, type, "STRESS");            
      result.conditions = this.convertThingToGameObject(result.conditions, type, "CONDITION");
      result.skills = this.convertThingToGameObject(result.skills, type, "SKILL");
      
      /*
      this.$set(result, 'show', {
        aspects: true,
        stress: true,
        conditions: true,
        consequences: true,
      });*/

      this.zone.sceneobjects.push(result);
    },
    addNPC() {      
      let npc = models.SceneNPC();
      this.zone.sceneobjects.push(npc);
    },
    /* adversary search */
    searchAdversaries(query) {      
      return new Promise((resolve) => {
        if (query.length < 3) {
          return resolve([])
        }

        dbSvc.ListObjects("ADVERSARY", null, query)          
          .then((data) => {            
            resolve(data)
          })
      })
    },
    getAdversaryResultValue(result) {      
      return result;
    },
    selectAdversaryResult(result) {
      //adversaries can be copied and we want uniqueIds      
      result.originalId = result.id;
      result.id = this.commonSvc.GenerateUUID();
      this.makeGameObject(result, "ADVERSARY");
      this.$refs.popoverAdversary.$emit('close');
    },    
    /* end adversary search */

    /* character search */
    searchCharacters(query) {      
      return new Promise((resolve) => {
        if (query.length < 3) {
          return resolve([])
        }

        //dbSvc.ListObjects("CHARACTER", this.$store.state.userId, query)
        dbSvc.ListObjects("CHARACTER", null, query)
          .then((data) => {            
            resolve(data)
          })
      })
    },
    getCharacterResultValue(result) {
      return result;
    },    
    selectCharacterResult(result) {
      //TODO: Make sure you can't add the same character if it already exists.
      this.makeGameObject(result, "CHARACTER");      
      this.$refs.popoverCharacter.$emit('close');   
    },    
    /* end character search */

    convertThingToGameObject(array, thing, type) {
      if (!array) return;

      let gameObject = new Array();

      switch(type) {        
        case "ASPECT":
          for (let [key, value] of Object.entries(array)) {
            if (thing == "ADVERSARY") {
              var subAspects = value.split(";");
              subAspects.forEach( item => {
                let aspect = models.SceneAspect(item, key, thing);
                gameObject.push(aspect);
              });                        
            } else {              
              let aspect = models.SceneAspect(value, key, thing);
              gameObject.push(aspect);
            }
          }
          break;
        case "STRESS":          
          for (let [key, value] of Object.entries(array)) {
            let stress = models.SceneStress(key, type)
            for (let [skey, svalue] of Object.entries(value)) {
              let stressbox = models.SceneStressBox(svalue)
              stress.boxes.push(stressbox)
            }          
            gameObject.push(stress);
          }
          break;
        case "CONDITION":          
          for (let [key, value] of Object.entries(array)) {            
            let condition = models.SceneCondition(key, type);
            condition.boxes.push(models.SceneStressBox(value))     
            gameObject.push(condition);
          }
          gameObject = gameObject.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "CONSEQUENCE":          
          for (let [key, value] of Object.entries(array)) {
            let consequence = models.SceneConsequence(key, (thing == "ADVERSARY" ? value : ''), (thing == "CHARACTER" ? value : ''), type);
            gameObject.push(consequence);
          }
          break;
        case "SKILL":          
          for (let [key, value] of Object.entries(array)) {            
            let skill = models.SceneSkill(parseInt(value) ? key : value, parseInt(key) ? value : key, type);
            gameObject.push(skill);
          }
          break;
      };

      return gameObject;
    },
    getChildPayload (index) {      
      return this.zone.sceneobjects[index];      
    },
    onZoneDrop (collection, dropResult) { 
      //get array      
      var zone = this.$parent.$data.scene.zones.find(obj => {
        return this.commonSvc.GetId(obj.id) === collection;
      });
      
      //if we re-ordered in the same container
      if (dropResult.addedIndex != null && dropResult.removedIndex != null) {        
        zone.sceneobjects.move(dropResult.removedIndex, dropResult.addedIndex);
      }
      else {
        if (dropResult.addedIndex != null) {
          zone.sceneobjects.splice(dropResult.addedIndex, 0, dropResult.payload)
        }
        
        if (dropResult.removedIndex != null) {
          zone.sceneobjects.splice(dropResult.removedIndex, 1);
        }
      }
    },
    onDragEnter() {      
      var containers = document.getElementsByClassName("smooth-dnd-container");
      [].forEach.call(containers, function (elem) {
        elem.classList.add("drop-preview");
      });
    }, 
    onDragEnd() {      
      var containers = document.getElementsByClassName("smooth-dnd-container");
      [].forEach.call(containers, function (elem) {
        elem.classList.remove("drop-preview");
      });
    }, 
    addZoneObject(type) {      
      switch(type) {
        case "aspect":
          let aspect = models.SceneAspect("", "", "");
          this.zone.aspects.push(aspect);
          break;
      }
    },
    editZone() {
      this.editing = !this.editing;
    }, 
    moveForward() {      
      const maxArray = this.$parent.highestZone();
      const found = maxArray.find(element => element.id == this.zone.id);
      const max = parseInt(maxArray[0].zindex) ?? 1;

      let z = parseInt(this.zone.zindex) ?? 1;

      //if this item was not found to be at max OR
      // this item is not the only item at max then go up 1
      if (!found || (found && maxArray.length > 1)) z++;            
      this.zone.zindex = z;
    },
    moveBackward() {
      let z = parseInt(this.zone.zindex) ?? 1;
      if (z > 1) z--;
      this.zone.zindex = z;
    },
    getGhostParent() {
      return document.getElementById("scene-canvas");
    },
    onDrag: function (x, y) {
      this.zone.x = x;
      this.zone.y = y;
    },
    onResize: function (x, y, width, height) {      
      this.zone.x = x;
      this.zone.y = y;
      this.zone.width = width
      this.zone.height = height
    },
    toggleZoneImageEdit() {      
      this.zoneImageEdit = !this.zoneImageEdit;
    },
    removeZone() {
      this.$parent.$data.scene.zones = this.$parent.$data.scene.zones.filter(( obj ) => {
        return obj.id !== this.zone.id;
      });       
    }
  }

}
</script>

<style lang="scss" scoped>
  .zone {
    min-height: 300px;
    min-width: 400px;    
  }

  .dragHandle {
    cursor: drag !important;
  }

  .cancelZoneDrag {
    cursor:default;
  }

  .drop-preview {
    background-color: rgba(150, 150, 200, 0.1) !important;
    border: 2px dashed black !important;
    margin: 5px !important;    
    min-height: 200px;
  }  
  
  .card-ghost {
    transition: transform 0.18s ease;
    transform: rotateZ(5deg);    
  }

  .card-ghost-drop {
    transition: transform 0.18s ease-in-out;
    transform: rotateZ(0deg);        
  }

  .zone-image {
    content: "";    
    opacity: 0.5;    
   
    position: absolute;
    z-index: -100; 

    object-fit: cover ; /* Do not scale the image */
    object-position: center; /* Center the image within the element */
    width: 98%;
    height: 98%;
    margin-bottom: 1rem;  
  }
  
  .smooth-dnd-draggable-wrapper {
    width: fit-content !important;
  }
  
</style>
