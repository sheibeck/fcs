<template>
  <div>    
    <div title="Click to edit" v-if="!editing" @click="canEdit()" class="editable">
      <label v-if="label">{{label}}</label>
      {{getThing}}
    </div>
    <div v-if="editing">
      <div class="input-group">  
        <input class="form-control-sm" v-model="object[item]" @keyup.enter="editing = false" />
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
    canEdit() {
      if (this.canEdit) {
        this.editing = true;
      }
    }
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
