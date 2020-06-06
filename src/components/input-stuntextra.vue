<template>
  <div>
    <div class="fate-header d-flex">
      <span :for="item" class="mr-auto">{{header}}</span>
      <a v-if="!isNewCharacter" v-on:click="toggleEdit()">
        <i class="fas d-print-none pr-2" :class="{ 'fa-check-circle' : stuntEdit, 'fa-edit' : !stuntEdit }"></i>
      </a>
    </div>

    <div class="form-group">    
      <textarea v-if="stuntEdit || isNewCharacter" class="form-control" :id="item" :name="item" :rows="rows" :placeholder="header" @change="$parent.setVal(item,  $event.target.value)" :value="$parent.getVal(item)"></textarea>
      <VueShowdown v-if="!stuntEdit && !isNewCharacter" class="h-auto p-2" :class="{border: border}" :options="{ emoji: false }" :style="{ 'min-height': minHeight + 'px' }" :markdown="getMarkupVal(item)" />
    </div>  
  </div>
</template>

<script>
import VueShowdown, { showdown } from 'vue-showdown';
import { mapGetters } from 'vuex'

export default {
  name: 'InputStuntExtra',
  props: {
    item: String,  
    edit: Boolean,  
    rows: Number,
    border: Boolean,
    header: String,
  },  
  computed: {
 	  ...mapGetters([
      'isAuthenticated',
      'roll20Enabled'
    ]),
    hasRoll20() {
      return this.isAuthenticated && this.roll20Enabled;
    },
    minHeight() {
      return this.rows * 25;
    },    
    isNewCharacter() {      
      return this.$route.name == "Character Sheet Detail";
    }
  },
  data () {
    return {  
      stuntEdit: null,
    }
  },
  methods: {
    toggleEdit() {      
      this.stuntEdit = !this.stuntEdit;     
      if (!this.stuntEdit == true) {
        this.$parent.$parent.$parent.save();
      } 
    },
    getMarkupVal(graphPath, defaultValue) {      
      let val = this.$parent.getVal(graphPath, defaultValue);
      
      var replacement = "";
      var eachLineExp = /\s*((?:.|\r\n)*)/g;
      var lineMatches = val.match(eachLineExp);

      if (!lineMatches) return val;
      
      //iterate over each line
      lineMatches.forEach( (lineMatch) => {
        
        //now try to find the name and the description separated by a colon
        var itemExp = /(.*):(.*)/;
        var itemMatch = itemExp.exec(lineMatch);
    
        if (!itemMatch) {
          replacement += lineMatch;
        }
        else {
          if (itemMatch[1] && itemMatch[2]) {            
            if (this.roll20Enabled) {                      
              var roll20Message = itemMatch[0].trim().replace(/\'/g,"").replace(/"/g,'\\\"');
              let roll20Btn = `<span class='dice fo20' onclick='fcs.$children[0].$children[0].$children[0].$refs.charactersheet.sendToRoll20(\"stuntextra\", \"Stunt\", null, \"${roll20Message}\")'>C</span>`;
              replacement += `${roll20Btn}<strong>${itemMatch[1].trim()}</strong>:${itemMatch[2]}`;
            }
            else {
              replacement += `<strong>${itemMatch[1].trim()}</strong>:${itemMatch[2]}`;
            }
          }
          else {  
            replacement += itemMatch[0];
          }
        }  
        
        replacement += "<br/>"
      })
     
      return replacement;
    },
  }
}
</script>

<style lang="scss" scoped>
</style>
