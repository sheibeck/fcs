<template>
  <div>    
    <div title="Click to edit" v-if="!editing" @click="toggleEdit()" class="editable">
      <label v-if="label">{{label}}</label>
      {{getThing}}
    </div>
    <div v-show="editing">
      <div class="input-group">  
        <input class="form-control-sm" ref="editor" v-model="object[item]" @keyup.enter="toggleEdit()" />
        <div class="input-group-append">
            <button type="button" class="input-group-text" @click="editing = false"><i class="fas fa-check-circle text-success"></i></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SceneEditableInput',
  props: {
    object: Object,
    item: String,
    label: String,
    canedit: Boolean
  },
  data () {
    return { 
      editing: false     
    }
  },  
  computed: {    
    getThing() {
      return this.object ? this.object[this.item] : "";
    }
  },
  methods: {
    toggleEdit() {         
      if (this.canEdit ?? true) {
        this.editing = !this.editing;
        if (this.editing) {
          setTimeout(() => {
            this.$refs.editor.focus();
          },250);
        }
      }
    },
  }

}
</script>

<style lang="scss" scoped> 
  .editable {
    cursor: pointer;

    .fas.fa-pencil-alt {
      color: #888;
    }
  }
</style>
