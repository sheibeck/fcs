<style lang="scss" scoped>
  label {
    font-weight: 700;
  }

  #canvas-wrapper {
    position:relative;
    height: 81vh;
    border: solid 2px black; 
    overflow: scroll;
    cursor:grab;
  }
  
  #scene-canvas {
    position:relative;
    height: 1800px;
    width: 2400px;    

    background-size: 20px 20px;
    background-image:
      linear-gradient(to right, #F0F0F0 1px, transparent 1px),
      linear-gradient(to bottom, #F0F0F0 1px, transparent 1px);
  }   
  
  #chat {
    width: 500px;

    #chat-log {      
      height: 77vh;
      overflow: scroll;
    }
  }

  #game-video {
    height: 80px;    
    position: absolute;
    bottom: 0;
  }
   
  /deep/ a {
    text-decoration: none;
  }

  /deep/ .btn-link {
    color: #888;
  }

  footer {
    display: none;
  }
</style>

<template>
  <div class="m-2">
   
    <loading :loading="isLoading" />

    <div v-show="!isLoading">
      <div class="d-flex flex-column flex-sm-row">
        <div title="Click to edit" v-if="!editingScene" @click="editingScene = true" class="h4">{{scene.name}}</div>
        <div v-if="editingScene">  
          <div class="input-group">  
            <input class="form-control-sm" v-model="scene.name" />
            <div class="input-group-append">
                <button type="button" class="input-group-text" @click="editingScene = false"><i class="fas fa-check-circle text-success"></i></button>
            </div>
          </div>
        </div>

        <div class="mr-auto ml-2">
          <em style="vertical-align: top;"><button type="button" class="btn btn-link p-0" title="Add Scene Aspect" @click="addAspect()"><i class="fas fa-sticky-note"></i></button> Aspects:</em>
          <sceneaspect :aspect="aspect" location="scene" v-for="aspect in scene.aspects" v-bind:key="aspect.id" />
        </div>

        <span v-if="isHost">
          <button type="button" class="btn-sm btn btn-primary ml-1" @click="addZone()"><i class="fas fa-shapes"></i> Add Zone</button>
          <button type="button" class="btn-sm btn btn-secondary d-none" @click="resetCanvas()"><i class="fas fa-undo"></i> Reset Canvas</button>
          <button type="button" class="btn-sm btn btn-success ml-1 d-none" @click="saveScene()"><i class="fas fa-save"></i> Save Scene</button>
          <button v-if="!isSceneRunning" type="button" class="btn-sm btn btn-info" @click="startGame()"><i class="fas fa-play"></i> Start Game</button>
          <button v-if="isSceneRunning" type="button" class="btn-sm btn btn-danger" @click="stopGame()"><i class="fas fa-stop-circle"></i> Stop Game</button>          
        </span>

        <span v-if="isSceneRunning">
          <button type="button" class="btn-sm btn btn-secondary ml-1" @click="joinGame()"><i class="fas fa-sign-language"></i> Join Game</button>
        </span>

        <span>
          <button title="Fullscreen" v-if="!fullScreen" type="button" class="btn-sm btn btn-secondary ml-1" @click="toggleFullScreen()"><i class="fas fa-expand-alt"></i></button>
          <button title="Exit fullscreen" v-if="fullScreen" type="button" class="btn-sm btn btn-secondary ml-1" @click="toggleFullScreen()"><i class="fas fa-compress-alt"></i></button>
        </span>
      </div>

      <div id="game-table" class="d-flex">
        <div id="canvas-wrapper" v-dragscroll:nochilddrag class="mr-auto">
          <div id="scene-canvas" class="bg-light mt-2" data-dragscroll>      
            <!-- zones -->        
            <scenezone :zone="zone" v-for="zone in scene.zones" :key="zone.id" class="panzoom-exclude"  />        
          </div>
        </div>
        <div>
          <i v-if="showchat" @click="showchat = false" class="fas fa-angle-double-right"></i>
          <i v-if="!showchat" @click="showchat = true" class="fas fa-angle-double-left"></i>
        </div>
        <div v-if="showchat" id="chat" class="d-flex flex-column">
          <div id="chat-log" class="border mb-1">            
          </div>
          <div class="d-flex">
            <input rows="1" id="chat-input" v-model="chatMessage" class="w-75 mr-1" />
            <button type="button" @click="sendChatMessage()">Submit</button>
          </div>
        </div>
      </div>     
    </div>

    <!-- add scene object -->
    <div class="modal" id="modalSceneObject" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">Add Scene Object</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CommonService from "./../assets/js/commonService";
import DbService from '../assets/js/dbService';
import Loading from '../components/loading';
import SceneZone from '../components/scene-zone';
import draggable from 'vuedraggable';
import SceneAspect from '../components/scene-aspect';
import { dragscroll } from 'vue-dragscroll';
import Panzoom from '@panzoom/panzoom'

import Peer from 'peerjs';
import PeerReceiver from "./../assets/js/peerReceiver";
import PeerSender from "./../assets/js/peerSender";

let commonSvc = null;
let dbSvc = null;

export default {
  name: 'SceneDetail',
  metaInfo() {
    return {
       title: `${this.scene ? this.scene.name : this.title}`,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  directives: {
    dragscroll
  },
  components: {
    loading: Loading,
    scenezone: SceneZone,
    sceneaspect: SceneAspect  
  },
  mounted(){    
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);    
    this.init();    
  },  
  watch: {
    userId() {
      //wait for our authenticated user id
      this.sceneId = commonSvc.SetId("SCENE", fcs.$route.params.id);
      this.getScene(this.userId, this.sceneId);      
    },
    scene: {
      // This will let Vue know to look inside the array
      deep: true,
      // We have to move our method to a handler field
      handler() {
        //this.drawScene()
      }      
    }
  },
  data () {
    return {     
      loading: true,
      scene : {},
      id: this.$route.params.id,
      canvas: null,     
      showchat: true,
      chatMessage: "",
      peerReceiver: null,
      peerSender: null,  
      saveInProgress: false,
      fullScreen: false,
      editingScene: false,
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
      'currentUser'
    ]),
    isNewScene : function() {
      return this.$route.params.id === "create";
    },
    isLoading : function() {
      return this.loading;
    },
    commonSvc() {
      return commonSvc;
    },
    userName() {
      var email = fcs.$store.state.userSession.getIdToken().payload["email"];
      return email.split("@")[0];
    },
    isHost() {      
      return this.scene.owner_id == this.userId;
    },
    isSceneRunning() {
      return this.scene.isrunning;
    }
  },
  methods: {
    init() {
      $(document).on('show.bs.modal', '#modalDeleteSessionConfirm', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var id = button.data('id') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);
        $(modal.find('.js-delete')).data('id', id);
      });
            
      //hide the footer for a better game table experience
      document.getElementsByTagName("footer")[0].className += " d-none";

      document.addEventListener('gameserver', (e) => {        
        this.scene.isrunning = e.detail.gameRunning;
        if (this.scene.gamePeerId !== e.detail)
        {
          this.scene.gamePeerId = e.detail;
          this.scene.isrunning = true;
          this.saveScene(true);
        }
      }, false);
      
      document.addEventListener('sceneupdate',  (e) => {           
        if (!this.isHost) {
          this.$set(this, 'scene', e.detail.message);
        }
      }, false);

      document.addEventListener('gameend',  (e) => {           
        if (this.isHost) {
          this.scene.isrunning = false;
          this.saveScene(true);
        }
      }, false);
      
      //panzoom the canvas
      /*const panElem = document.getElementById('scene-canvas')
      const panzoom = Panzoom(panElem, {
        maxScale: 5
      });
            
      panElem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)
      this.canvas = panzoom;*/      
    },   
    startGame() {
      let peerId = this.scene.gamePeerId ?? commonSvc.GetId(this.scene.id);
      this.peerReceiver = new PeerReceiver();
      this.peerReceiver.initialize();
    },
    stopGame() {
      if (this.isHost)
      {
        this.peerReceiver.endScene();
      }
    },    
    joinGame() {      
      const peerId = this.scene.gamePeerId;
      this.peerSender = new PeerSender(peerId);
      this.peerSender.initialize();

      setTimeout( () => {
        this.peerSender.join(this.userName);        
      }, 2000);      
    },    
    resetCanvas() {
      this.canvas.reset();
    },
    getScene : function(ownerId, id) {
      var $component = this;

      if (this.id === "create") {
        this.create();
        return;
      }

      dbSvc.GetObject(id).then ( (response) => {   
        if (!response)
        {
          commonSvc.Notify(`Could not find scene with id <b>${commonSvc.GetId(id)}</b>`, 'error', 2000, () => {
            document.location = '/scene';
          });
        }
        else {
          $component.$set($component, 'scene', response);          
          $component.name = $component.scene.name + ' (SCENE)';
          $component.description = $component.scene.description || "";    
        }

        //cleanup from shutdown if we left the game running
        if (this.isHost && $component.scene.isrunning) {
          $component.scene.isrunning = false;
          this.saveScene(true);
        }

        $component.loading = false;    
      })
    },   
    create : function() {
      let c = {
        "description": "",
        "object_type": "SCENE",
        "id": null,
        "owner_id": this.userId,        
        "scale": "",
        "slug": "new-scene",
        "name": "New Scene",        
      };
      this.$set(this, 'scene', c);
      this.loading = false;
    },
    saveScene : function(suppressMessage) {
      if (this.isHost) {        
        var $component = this;

        if (!this.scene.name) {
          commonSvc.Notify('You must enter a name', 'error');
          return;
        }

        //create a new scene Id if we don't have one
        let isNew = false;
        if (!$component.scene.id) {
            isNew = true;
            $component.$set($component.scene, "id", `SCENE|${commonSvc.GenerateUUID()}`);
            $component.$set($component.scene, "owner_id", this.userId);
        }
    
        dbSvc.SaveObject($component.scene).then( (response) => {
          if (response) {
            if (suppressMessage !== true || isNew) {
              commonSvc.Notify('Scene saved.', 'success', null, () => {;
                if (isNew) {
                  location.href = '/scene/' + commonSvc.GetId($component.scene.id) + '/' + $component.scene.slug;
                }
              });
            }
          }
        });
      }     
    },
    drawScene() {    
      if (this.isHost) {        
        this.saveScene(true);
      }
      if (this.peerSender && this.peerSender.conn.open) {
        this.peerSender.updateScene(this.scene, this.peerSender.conn.connectionId);
      }
    },     
    addZone() {
      let id = commonSvc.GenerateUUID();
      let zone = {        
        zindex: "2",
        id: `ZONE|${id}`,
        name: "New Zone",
        x: 0,
        y: 0,
        aspects: [         
        ],
        sceneobjects : [
        ]
      };
      if (!this.scene.zones) {
        this.$set(this.scene, 'zones', new Array());
      }
      this.scene.zones.push(zone);
      this.$forceUpdate();
    },
    addAspect() {
      let aspect = {id:commonSvc.GenerateUUID(), name: "Aspect Name", editing: true, invokes: [{id:commonSvc.GenerateUUID(), used: false}]};
      if (!this.scene.aspects) {        
        this.$set(this.scene, 'aspects', new Array());
      }
      this.scene.aspects.push(aspect);
    },
    highestZone() {      
      var max = Math.max.apply(Math, this.scene.zones.map(function(o) { return o.zindex; }));
      const zonesAtMaxHeight = this.scene.zones.filter(z => z.zindex == max);
      return zonesAtMaxHeight;
    },
    slugify : function(event) {
      let $elem = $(event.currentTarget);
      let slug = commonSvc.Slugify($elem.val());
      this.$set(this.campaign, "slug", slug);
    },
    sendChatMessage() {      
      //send data to peer connections
      if (this.peerSender) {
        this.peerSender.sendChatMessage(this.userName, this.chatMessage);
        this.chatMessage = "";
      }      
    },
    toggleFullScreen() {
      this.fullScreen = !this.fullScreen;
      if (this.fullScreen) {
        document.getElementsByClassName("navbar")[0].classList.add("d-none");
        document.getElementsByClassName("navbar")[0].classList.add("d-none");                
        document.getElementById("canvas-wrapper").style.height = "94vh";
        debugger;
        document.getElementById("chat-log").style.height = "90vh";

        //for test modes that add an environment header
        document.getElementsByClassName("d-print-none")[0].classList.add("d-none");
      }
      else {
        document.getElementsByClassName("navbar")[0].classList.remove("d-none"); 
        document.getElementById("canvas-wrapper").style.height = "81vh";
        document.getElementById("chat-log").style.height = "77vh";

        //for test modes that add an environment header
        document.getElementsByClassName("d-print-none")[0].classList.remove("d-none");       
      }
    }
  }
}
</script>
