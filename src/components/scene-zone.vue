<template>  
  <vue-draggable-resizable :id="`zone-${commonSvc.GetId(zone.id)}`" class="p-1 m-1 d-flex border bg-white zone draggable-item" 
        drag-handle=".zoneHandle" :parent="true" :drag-cancel="'.cancelZoneDrag'" :x="zone.x" :y="zone.y"
        :w="zone.width" :h="zone.height" @dragging="onDrag" @resizing="onResize" :style="`z-index:${this.zone.zindex};`">
    
    <!-- zone background image and editor -->
    <img v-if="zone.backgroundImage && !zoneImageEdit" :src="zone.backgroundImage" class="img-fluid zone-image" />
   
    <!-- drag handle -->
    <i class="fas fa-expand-arrows-alt p-1 mr-1 bg-dark text-white zoneHandle"></i>
          
    <!-- details -->
    <div class="mr-auto cancelZoneDrag w-100">
      <!-- zone image editor -->
      <div v-if="zoneImageEdit" class="m-2 p-2 border bg-light">
        <label class="control-label">Zone Image Url</label><br/>    
        <div class="input-group">      
          <input v-model="zone.backgroundImage" class="form-control" />
          <div class="input-group-append" style="height: 38px;">
            <button type="button" class="input-group-text" @click="toggleZoneImageEdit()"><i class="fas fa-check-circle text-success"></i></button>
          </div>       
        </div>
        <div>
          <a target="_blank" :href="`https://www.google.com/search?safe=strict&tbm=isch&q=${this.zone.name}`" title="Search for image">Search for image</a>
        </div>        
      </div>     

      <header v-if="!zoneImageEdit">
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

      <div v-if="!zoneImageEdit" :id="`drag-container-${commonSvc.GetId(zone.id)}`" class="border" style="min-height:150px;height:94%;width:100%;">
        
        <sceneobject :objectdata="item" v-for="item in zone.sceneobjects" :key="item.id" />
      
      </div>  
      
    </div>

    <div class="d-flex flex-column bg-light pl-1">
      <button type="button" class="btn btn-link p-0" title="Add Zone Aspect" @click="addZoneObject('aspect')"><i class="fas fa-sticky-note"></i></button>    
      <b-button :id="`add-character-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add Character"><i class="fas fa-user-circle"></i></b-button>  
      <b-popover ref="popoverCharacter" @shown="$refs.characterAutocomplete.$refs.input.focus()" :target="`add-character-${this.zone.id}`" triggers="click blur">
        <template v-slot:title>Add Character</template>
        <autocomplete ref="characterAutocomplete" :search="searchCharacters"
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
        <div class="mt-1 ml-2 small">
          Searches your characters and the character's of other players in this scene. You can search by <em>name, aspect, character sheet type</em>.
        </div>
      </b-popover>
      <b-button :id="`add-adversary-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add Adversary"><i class="fas fa-theater-masks"></i></b-button>
      <b-popover ref="popoverAdversary" @shown="$refs.adversaryAutocomplete.$refs.input.focus()" :target="`add-adversary-${this.zone.id}`" triggers="click blur">
        <template v-slot:title>Add Adversary</template>
        <autocomplete ref="adversaryAutocomplete" :search="searchAdversaries"
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
              <div><label class="p-0 m-0">System:</label> {{result.system||"Unknown"}}</div>
              <div><label class="p-0 m-0">Genre:</label> {{result.genre||"Unknown"}}</div>
            </div>
          </li>
        </template>
        </autocomplete>
        <div class="mt-1 ml-2">          
          <input type="checkbox" class="mr-1" ref="adversarySearchMine" />Search only my adversaries?
          <div class="small">You can search by <em>name, aspect, type, system, or genre</em>.</div>
        </div>
      </b-popover>     
      <b-button :id="`add-npc-${this.zone.id}`" type="button" variant="link" class="btn btn-link p-0" title="Add NPC" @click="addNPC()"><i class="fas fa-users"></i></b-button>
      <button type="button" class="btn btn-link p-0" @click="toggleZoneImageEdit()" title="Edit zone image"><i class="fas fa-image"></i></button>
      
      <button type="button" class="btn btn-link p-0 mt-auto" @click="moveForward()" title="Move zone forward"><i class="fas fa-chevron-circle-up"></i></button>
      <button type="button" class="btn btn-link p-0" @click="moveBackward()" title="Move zone backward"><i class="fas fa-chevron-circle-down"></i></button>
      <button type="button" class="btn btn-link p-0" @click="removeZone()" title="Delete zone"><i class="fas fa-trash-alt"></i></button>      
    </div>  
  </vue-draggable-resizable>
</template>

<script>
import SceneObject from './scene-object';
import SceneAspect from './scene-aspect';
import VueDraggableResizable from 'vue-draggable-resizable';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';
import CommonService from '../assets/js/commonService';
import Autocomplete from '@trevoreyre/autocomplete-vue'
import DbService from '../assets/js/dbService';
import Models from '../assets/js/models';
import bootbox from 'bootbox';

let dbSvc = null;
let models = new Models();

export default {
  name: 'SceneObject',
  props: {
    zone: Object,
  },  
  components: {      
    'vue-draggable-resizable': VueDraggableResizable,
    sceneobject: SceneObject,
    zoneaspect: SceneAspect,    
    Autocomplete
  },  
  created() {    
    dbSvc = new DbService(this.$root);
    this.init();
  },
  computed: {
    hasZoneImage() {
      return this.zone.backgroundImage;
    },  
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
      if (!result || ( type == "CHARACTER" && this.characterExists(result.id) )) return;
                  
      result.aspects = this.convertThingToGameObject(result.aspects, type, "ASPECT");
      result.consequences = this.convertThingToGameObject(result.consequences, type, "CONSEQUENCE");      
      result.stress = this.convertThingToGameObject(result.stress, type, "STRESS");            
      result.conditions = this.convertThingToGameObject(result.conditions, type, "CONDITION");
      result.skills = this.convertThingToGameObject(result.skills, type, "SKILL");         
            
      let stuntArray = this.convertThingToGameObject(result.stunts, type, "STUNTEXTRA");
      result.stunts = null;
      let extrasArray = this.convertThingToGameObject(result.extras, type, "STUNTEXTRA");
      result.extras = null;

      result.stuntextras = new Array();      
      if (stuntArray) {
        result.stuntextras = result.stuntextras.concat(stuntArray);
      }
      if (extrasArray) {
        result.stuntextras = result.stuntextras.concat(extrasArray);
      }

      this.zone.sceneobjects.push(result);
    },   
    characterExists(id) {      
      let isCharacterInScene = this.$parent.$data.scene.zones.find(( zone ) => {
        return zone.sceneobjects.find((obj) => {
          return obj.id == id;
        }) 
      });
      
      if (isCharacterInScene) {
        this.commonSvc.Notify(`Character is already in the scene.`, 'warning');
        return true;
      }
      
      return false;      
    },
    addNPC() {      
      let npc = models.SceneNPC();
      this.zone.sceneobjects.push(npc);
    },
    /* adversary search */
    searchAdversaries(query) {
      return new Promise( async (resolve) => {
        if (query.length < 3) {
          return resolve([])
        }        
        let ownerId = null;
        if (this.$refs.adversarySearchMine.checked) {
          ownerId = this.$store.state.userId;
        }
        let adversaries = await dbSvc.ListObjects("ADVERSARY", ownerId, query);       
        resolve(adversaries);       
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
      return new Promise( async (resolve) => {
        if (query.length < 3) {
          return resolve([])
        }
        
        //search through all the players characters
        let players = this.$parent.$data.scene.players;
        let characters = [];
      
        for (let player = 0; player < players.length; player++) {
          let data = await dbSvc.ListObjects("CHARACTER", players[player].playerId, query);
          if (data.length > 0) characters.push(data);
        }

        characters = characters.map(o => o).flat();

        resolve(characters);
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

      let characterGameObjects = ["ASPECT", "CONSEQUENCE"]

      //only show aspects for characters. We want to drive players to use the sheets
      if (thing == "CHARACTER" && !characterGameObjects.includes(type)) return;

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
            let valIsNum = !isNaN(parseInt(value));      
            let name = valIsNum ? key : value; //if the value is not a number, then the name is in the value
            let val = valIsNum ? value : key // if the value is a number, use the value, otherwise the value is in the key
            let skill = models.SceneSkill(name, val, type);
            gameObject.push(skill);
          }
          break;
        case "STUNTEXTRA":          
          //character stunts/extras are string, so attempt to parse them
          if (thing == "CHARACTER") {        
            let items = array.split('\n');
            items.forEach(item => {
              let stuntextra = null;
              var tempItem = item.split(":");
              if (tempItem.length > 1) {
                stuntextra = models.SceneStuntExtra(tempItem[0], tempItem[1], type);
              }
              else {
                stuntextra = models.SceneStuntExtra(tempItem, "Stunt/extra effect" , type);
              }
              gameObject.push(stuntextra);
            })
          }
          else {
            //adversaries are already an array
            for (let [key, value] of Object.entries(array)) {            
              let stuntextra = models.SceneStuntExtra(key, value, type);
              gameObject.push(stuntextra);
            }
          }

          break;
      };

      return gameObject;
    },
    getChildPayload (index) {      
      return this.zone.sceneobjects[index];      
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
      bootbox.confirm({
        title: "Delete Zone?",
        message: "Are you sure you want to delete this zone? All objects in this zone will also be removed. Continue?",
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
            this.$parent.$data.scene.zones = this.$parent.$data.scene.zones.filter(( obj ) => {
              return obj.id !== this.zone.id;
            });  
          }
        }
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

  .zoneHandle {
    cursor: pointer;
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
