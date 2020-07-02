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
        <!-- scene name -->
        <editableinput :object="scene" item="name" :canedit="isHost" class="h4" />

        <div class="mr-auto ml-2">
          <em style="vertical-align: top;"><button type="button" class="btn btn-link p-0" title="Add Scene Aspect" @click="addAspect()"><i class="fas fa-sticky-note"></i></button> Aspects:</em>
          <sceneaspect :aspect="aspect" location="scene" v-for="aspect in scene.aspects" v-bind:key="aspect.id" />
        </div>

        <editableinput v-if="isConnected" :object="getPlayer(this.userId)" :canedit="this.userId == getPlayer(this.userId).id" item="username" label="Username:" />
       
        <span v-if="isHost">
          <button type="button" class="btn-sm btn btn-primary ml-1" @click="addZone()"><i class="fas fa-shapes"></i> Add Zone</button>
          <button type="button" class="btn-sm btn btn-secondary d-none" @click="resetCanvas()"><i class="fas fa-undo"></i> Reset Canvas</button>
          <button type="button" class="btn-sm btn btn-success ml-1 d-none" @click="saveScene()"><i class="fas fa-save"></i> Save Scene</button>
          <button v-if="!isSceneRunning" type="button" class="btn-sm btn btn-info" @click="startGame()"><i class="fas fa-play"></i> Start Game</button>
          <button v-if="isSceneRunning" type="button" class="btn-sm btn btn-danger" @click="stopGame()"><i class="fas fa-stop-circle"></i> Stop Game</button>          
        </span>

        <span v-if="isSceneRunning">
          <button v-if="!isConnected" type="button" class="btn-sm btn btn-secondary ml-1" @click="joinGame()"><i class="fas fa-sign-language"></i> Join Game</button>
          <button v-if="isConnected" type="button" class="btn-sm btn btn-secondary ml-1" @click="exitGame()"><i class="fas fa-sign-language"></i> Join Game</button>
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
          <div id="player-list">
              {{getPlayerList}}
          </div>
          <div class="d-flex">
            <input rows="1" id="chat-input" v-model="chatMessage" @keyup.enter="sendChatMessage()" class="w-75 mr-1" />
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
import SceneEditableInput from '../components/scene-editable-input';
import draggable from 'vuedraggable';
import SceneAspect from '../components/scene-aspect';
import { dragscroll } from 'vue-dragscroll';
import Panzoom from '@panzoom/panzoom'

import Peer from 'peerjs';
import PeerReceiver from "./../assets/js/peerReceiver";
import PeerSender from "./../assets/js/peerSender";
import FCSVTTClient from "./../assets/js/fcsVTTClient";

let commonSvc = null;
let dbSvc = null;
let vttClient = null;

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
    sceneaspect: SceneAspect,
    editableinput: SceneEditableInput,
  },
  created() {    
    vttClient = new FCSVTTClient();
  },
  mounted(){    
    commonSvc = new CommonService(this.$root);
    dbSvc = new DbService(this.$root);       
  },  
  watch: {
    userId() {
      //wait for our authenticated user before we setup the scene
      this.setupScene(this.userId);                
    },
    scene: {
      // This will let Vue know to look inside the array
      deep: true,
      // We have to move our method to a handler field
      handler() {
        if (!this.isLoading) {
          if (this.scene.isrunning) {
            this.broadCastSceneChange();
          }

          if (this.isHost) {
            this.saveScene(true); //make sure that host still saves things if the game isn't actively running.
          }
        }
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
      isUpdating: false,
      isConnected: false,
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
      return this.getPlayer(this.userId).username;
    },
    isHost() {      
      return this.scene.owner_id == this.userId;
    },
    isSceneRunning() {
      return this.scene.isrunning;
    },    
    getPlayerList() {      
      if (!this.scene || !this.scene.players) {
        return "No players.";
      }

      let players = "";
      this.scene.players.forEach(player => {
        players += `${player.username} (${player.lastPeerId}),`;
      })
      return players;
    }
  },
  methods: {
    init() {
      //panzoom the canvas
      /*const panElem = document.getElementById('scene-canvas')
      const panzoom = Panzoom(panElem, {
        maxScale: 5
      });
            
      panElem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)
      this.canvas = panzoom;*/      
    },      
    setupScene(userId) {
      if (this.userId == "public") {
        commonSvc.Notify("You must be logged in to use this feature.", "error", 2000, () => { document.location.href = `/login?redirect=${document.location.href}` });
        return;
      };

      this.sceneId = commonSvc.SetId("SCENE", fcs.$route.params.id);
      
      this.getScene(this.userId, this.sceneId);      
      
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
        //if the gameserver is running then setup the game
        switch(e.detail.type) {
          case "connected":
            this.sendSystemMessage("Game server is running. Waiting for players...");
            this.setupGameServer(e);
            break;
          case "scene":
            //if the host isn't connected as a user, make sure we still update the server
            // when others make changes
            if (!this.isConnected) {
              this.scene = e.detail.message;  
            }
            break;          
          case "disconnected":
            //server disconnected
            this.sendSystemMessage("Game server has disconnected!");
            break;
        }
      }, false);

      document.addEventListener('userconnected', (e) => {
        this.peerSender.join(this.userName);               
        this.isConnected = true;
      }, false);

      document.addEventListener('userjoined', (e) => {
        this.updatePlayer("lastPeerId", this.peerSender.peer.id);
      }, false);

      document.addEventListener('userdisconnected', (e) => {
        this.isConnected = false;
        this.peerSender.displayChatMessage({ "username": "System", "message": "You have diconnected..." });
      }, false);
      
      document.addEventListener('sceneupdate',  (e) => {        
        if (e) {
          this.isUpdating = true;
          this.$set(this, 'scene', e.detail.scene);          
        }
      }, false);

      document.addEventListener('gameend',  (e) => {           
        if (this.isHost) {
          this.scene.isrunning = false;
        }
      }, false);

      document.addEventListener('gameerror',  (e) => {           
        if (this.isHost) {
          this.commonSvc.Notify(e.detail.message);
          this.scene.isrunning = false;    
        }
      }, false); 
      
      document.addEventListener('charactersheet', (e) => {
        
      }, false);

      window.addEventListener("message",  (e) => {
        this.sendFormattedChat(e);
      }, false);
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
    },
    exitGame() {
      this.peerSender.conn.close();
    },
    updatePlayer(key, value)
    {
      var idx = this.scene.players.findIndex(obj => {
        return obj.id === this.userId
      })
      
      this.scene.players[idx][key] = value;      
    },
    resetCanvas() {
      this.canvas.reset();
    },
    async getScene(ownerId, id) {
      var $component = this;

      if (this.id === "create") {
        this.create();
        return;
      }

      this.scene = await dbSvc.GetObject(id);
      
      if (!this.scene)
      {
        commonSvc.Notify(`Could not find scene with id <b>${commonSvc.GetId(id)}</b>`, 'error', 2000, () => {
          document.location = '/scene';
        });
      }      

      //cleanup from shutdown if we left the game running
      if (this.isHost && this.isSceneRunning) {
        this.scene.isrunning = false;
        this.saveScene(true);
      }

      this.configureUser();

      this.loading = false;
    },   
    configureUser() {      
      //add this user to the scenes user list. We'll use this to let users configure things
      //about themselves like their username.      
      if (!this.scene.players) {
        this.scene.players = new Array();
      }

      let player = this.getPlayer(this.userId);
      if (!player) {        
        let player = {
          "id": this.userId,
          "username": this.$store.state.userSession.getIdToken().payload.email.split("@")[0],
        }
        this.scene.players.push(player);
        player = this.getPlayer(player.id);
      }      
    },
    getPlayer(id) {
      if (!this.scene.players) return null;
      return this.scene.players.find(obj => {
        return obj.id === id
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
    broadCastSceneChange() {
      //don't broadcast when you are the receiver of an update
      if (this.isUpdating) {
        this.isUpdating = false;
        return;
      }

      if (!this.isLoading && this.peerSender && this.peerSender.peer.open) {
        this.peerSender.updateScene(this.scene, this.peerSender.peer.id);
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
      let aspect = {id:commonSvc.GenerateUUID(), name: "Aspect Name", invokes: []};
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
    sendSystemMessage(message) {
      this.peerReceiver.displayChatMessage(message);     
    },
    sendChatMessage() {      
      //send data to peer connections
      if (this.peerSender) {
        //check for a chat command
        let regex = /^(\/[w]*) (\w*) (.*)/;
        let match = this.chatMessage.match(regex);
        if (match) {
          let command = match[1];
          let message = match[3];
          let player = this.scene.players.find(obj => {
            return obj.username === match[2];
          });

          if (!player) {
            this.commonSvc.Notify("Player not found!");
            return;
          }
          else {          
            this.peerSender.sendPrivateMessage(this.userName, player, message);
          }
        }
        else {
          this.peerSender.sendChatMessage(this.userName, this.chatMessage);
          this.chatMessage = "";
        }
      }        
    }, 
    sendLocalChat(msg) {
      let chatLog = document.getElementById("chat-log");
      let chatLogMessage = document.createElement("DIV");                  
      chatLogMessage.innerHTML = msg;
      chatLog.appendChild(chatLogMessage);
      chatLog.scrollTop = chatLog.msg;    
    },  
    sendFormattedChat(e) {
      if (e.data.type !== "charactersheet") return;
      let msg = e.data.data;
      if (this.peerSender) {
        this.peerSender.sendChatMessage(this.userName, msg);
      } else {
        this.sendLocalChat(msg);
      }
    },
    toggleFullScreen() {
      this.fullScreen = !this.fullScreen;
      if (this.fullScreen) {
        document.getElementsByClassName("navbar")[0].classList.add("d-none");
        document.getElementsByClassName("navbar")[0].classList.add("d-none");                
        document.getElementById("canvas-wrapper").style.height = "94vh";        
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
    },   
    setupGameServer(e) {
      this.scene.isrunning = true;
      if (this.scene.gamePeerId !== e.detail.peerid)
      {
        this.scene.gamePeerId = e.detail.peerid;        
        this.saveScene(true);
      }
    }
  }
}
</script>
