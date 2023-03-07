<template>
  <div class="input-field-list">
    <dynamic-list
      :Field="localField"
      :values="data"
      readonly
      ref="fieldList"
      selection="multiple"
    >
      <template v-slot:top>
        <q-btn-group class="action-buttons">
          <q-btn
            icon="content_copy"
            @click="copy"
          >
            <q-tooltip>拷贝选中</q-tooltip>
          </q-btn>
          <q-btn
            icon="content_paste"
            @click="paste"
          >
            <q-tooltip>粘贴</q-tooltip>
          </q-btn>
          <q-btn
            icon="update"
            @click="batch"
            v-if="$refs.fieldList && $refs.fieldList.selected.length > 0"
          >
            <q-tooltip>批量修改</q-tooltip>
          </q-btn>
        </q-btn-group>
      </template>
      <template v-slot:header-actions>
        <q-btn
          flat
          round
          icon="add"
          @click="addField"
        ></q-btn>
      </template>
      <template v-slot:body-actions="props">
        <q-btn
          flat
          round
          icon="edit"
          @click="editingField=props.row"
        ></q-btn>
        <q-btn
          flat
          round
          icon="delete"
          @click="deleteField(props)"
        ></q-btn>
      </template>
      <template v-slot:warning>
        <slot name="warning"></slot>
      </template>
    </dynamic-list>

    <free-field
      :Field="editingFieldField"
      :values="editingField"
      @cancel="editingField = undefined; $emit('cancel')"
      @save="saveField"
      @input="$emit('input')"
      @update:field="editingFieldChanged"
    ></free-field>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';
import DynamicList from './DynamicList';

const clipBoardStore = {
  content: '',
  items: [],
};

// const DynamicList = { ...DList };
// DynamicList.mixins = (DynamicList.mixins || []).concat(InputFieldMixin.mixins);
// DynamicList.props = { ...InputFieldMixin.props, ...DynamicList.props };
// DynamicList.computed = {

//   ...InputFieldMixin.computed,
//   ...DynamicList.computed,
// };
// DynamicList.methods = {

//   ...InputFieldMixin.methods,
//   ...DynamicList.methods,
// };
// DynamicList.created = DynamicList.created || InputFieldMixin.created;

export default defineComponent({
  name: 'InputFieldList',
  mixins: [mixins.InputFieldMixin],
  emits:['save', 'delete', 'cancel','paste:fields', 'batch:fields'],
  fieldInfo: {
    Category: 'Advanced',
    Label: '字段列表',
    Value: 'FieldList',
    Description: '',
  },
  components: {
    DynamicList,
  },
  data() {
    return {
      editingField: undefined,
      changedFields: [],
    };
  },
  computed: {
    editingFieldField() {
      return {
        Type: 'FieldEditor',
        Name: '',
        show: !!this.editingField,
      };
    },
    localField() {
      return {
        Type: 'DynamicList',
        showTop: true,
        Name: this.Field && this.Field.Name ? this.Field.Name : 'Fields',
        Options: {
          Columns:
            this.Field && this.Field.Options && this.Field.Options.Columns
              ? this.Field.Options.Columns
              : [
                {
                  Label: '#',
                  Name: 'Index',
                  sortable: true,
                  style: 'max-width: 100px;',
                },
                // {
                //   Label: '日期',
                //   Name: 'LastUpdateDate',
                //   style: 'max-width: 160px;',
                //   sortable: true,
                //   Options: {
                //     Filters: 'normalDate',
                //   },
                // },
                {
                  Label: '名称',
                  Name: 'Name',
                  style: 'max-width: 300px; overflow: hidden',
                  sortable: true,
                },
                {
                  Label: '标题',
                  Name: 'Label',
                  style: 'max-width: 300px; min-width: 100px',
                  sortable: true,
                },
                {
                  Label: '类型',
                  Name: 'Type',
                  style: 'max-width: 200px; min-width: 100px',
                  sortable: true,
                },
              ],
        },
      };
    },
  },
  methods: {
    addField() {
      let newIndex = 1;

      if (this.data) {
        const fName = this.Field && this.Field.Name ? this.Field.Name : 'Fields';
        const fData = this.data[fName];

        if (fData && fData.length) {
          newIndex = fData[fData.length - 1].Index + 1;
        }
      }

      this.editingField = {
        Index: newIndex,
      };
    },
    saveField() {
      if (!this.editingField) return;
      const theField = { ...this.editingField };

      if (theField.isBatchEditing) {
        if (this.$refs.fieldList.selected.length > 0) {
          const items = [];
          for (let i = 0; i < this.$refs.fieldList.selected.length; i += 1) {
            const item = this.$refs.fieldList.selected[i];

            if (item && item.id) {
              items.push(item.id);
            }
          }

          const newFld = {};
          for (let i = 0; i < this.changedFields.length; i += 1) {
            const fld = this.changedFields[i];
            if (fld && typeof theField[fld] !== 'undefined') {
              newFld[fld] = theField[fld];
            }
          }
          this.editingField = undefined;
          this.$emit(
            'batch:fields',
            { ...newFld, ids: items.join(',') },
          );
        }
      } else {
        if (typeof theField.auto__index === 'undefined') {
          // adding new
          this.$refs.fieldList.addRow(theField);
        }

        this.editingField = undefined;

        this.$emit('save', theField);
      }
    },
    deleteField(p) {
      this.$refs.fieldList.deleteRow(p);
      this.$emit('delete', p.row);
    },
    copy() {
      clipBoardStore.items = [];

      if (
        !this.$refs.fieldList
        || !this.$refs.fieldList.selected
        || this.$refs.fieldList.selected.length <= 0
      ) {
        return;
      }

      const items = [];
      for (let i = 0; i < this.$refs.fieldList.selected.length; i += 1) {
        const item = this.$refs.fieldList.selected[i];

        if (item) {
          items.push(item.id);
        }
        clipBoardStore.items.push(item);
      }

      if (items.length <= 0) return;

      clipBoardStore.content = `EIS_FLOW_FIELD_COPY:${items.join(',')}`;
    },
    paste() {
      // local paste
      if (clipBoardStore.items && clipBoardStore.items.length > 0) {
        const fName = (this.Field && this.Field.Name) ? this.Field.Name : 'Fields';
        this.data[fName] = this.data[fName] || [];
        this.data[fName] = this.data[fName].concat(clipBoardStore.items.map((i) => {
          delete i.id;
          delete i.auto__index;
          return i;
        })).sort((a, b) => a.Index - b.Index);
      }

      // emit to parent
      if (
        clipBoardStore.content
        && clipBoardStore.content.startsWith('EIS_FLOW_FIELD_COPY:')
      ) {
        this.$emit(
          'paste:fields',
          clipBoardStore.content.substr('EIS_FLOW_FIELD_COPY:'.length),
          clipBoardStore.items,
        );
      }
    },
    editingFieldChanged(f) {
      if (!f) return;
      this.changedFields.push(f);
    },
    batch() {
      if (
        !this.$refs.fieldList
        || !this.$refs.fieldList.selected
        || this.$refs.fieldList.selected.length <= 0
      ) {
        return;
      }

      this.editingField = {
        isBatchEditing: true,
      };
    },
  },
});
</script>
