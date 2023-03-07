<template>
  <span class="input-field-permission">
    <slot name="warning"></slot>
    <div class="buttons relative-position" v-if="Field && Field.ShowButtons">
      <span class="q-ml-lg select-all-btn">
        <q-btn round icon="check" @click="fieldData = Object.assign({},serviceList)"></q-btn>
      </span>
      <span class="q-ml-md clear-btn">
        <q-btn round icon="clear" @click="fieldData = {}"></q-btn>
      </span>
    </div>
    <div class="roles relative-position row items-center">
      <q-radio
        class="role"
        v-model="currentRole"
        v-for="(r, idx) in (Field && Field.Roles) || []"
        :key="idx"
        :val="r.Name"
        :label="r.Name || idx"
        @input="fieldData = r.Permission || {};$emit('input')"/>
    </div>
    <permission-editor
      v-if="Field && !Field.HideEditor"
      class="permission-editor"
      :Permission="fieldData"
      :Service="serviceList"
      :readonly="Field.ReadOnly"
      @changed="permissionChanged"
      :noDataScope="Field.NoDataScope"
    ></permission-editor>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';
import PermissionEditor from './PermissionEditor';

export default defineComponent({
  name: 'InputFieldPermission',
  mixins: [mixins.InputFieldMixin],
  emits:['input'],
  fieldInfo: {
    Category: 'Advanced',
    Label: '权限编辑器',
    Value: 'Permission',
    Description: '',
  },
  components: { PermissionEditor },
  data() {
    return {
      serviceList: {},
      currentRole: null
    };
  },
  created() {
    // get all service list
    if (this.Field.Type === 'Permission' && !!this.Field.ServiceList) {
      this.getRequest(this.Field.ServiceList).then((d) => {
        if (d && d.msg === 'OK') {
          this.serviceList = d.data;
        }
      });
    }
  },
  methods: {
    permissionChanged(v) {
      if (!v && this.data) {
        this.data[this.Field.Name] = {};
      } else if (v) {
        this.data[this.Field.Name] = v;
      }

      this.$emit('input');
    },
  },
});
</script>
<style lang="sass" scoped>
.input-field-permission
  .buttons
    height: 48px
</style>
