<template>
  <div class="free-field-list row full-width">
    <span :class="`field-label ${(Field.Label && Field.Label.trim().length)
      ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`" v-if="Field.Label !== void 0">
      <q-tooltip v-if="Field.Description" anchor="top right">{{ Field.Description }}</q-tooltip>
      {{ Field.Label || '' }}
      <span v-if="Field.Required" class="required-mark">*</span>
    </span>

    <dynamic-list class="col" :Field="localField" :values="values" readonly ref="fieldList" selection="multiple">
      <template v-slot:top>
        <q-btn-group class="action-buttons">
          <q-btn icon="content_copy" @click="copy">
            <q-tooltip>拷贝选中</q-tooltip>
          </q-btn>
          <q-btn icon="content_paste" @click="paste">
            <q-tooltip>粘贴</q-tooltip>
          </q-btn>
          <q-btn icon="update" @click="batch" v-if="fieldListLength > 1">
            <q-tooltip>批量修改</q-tooltip>
          </q-btn>
        </q-btn-group>
      </template>
      <template v-slot:header-actions>
        <q-btn flat round icon="add" @click="addField"></q-btn>
      </template>
      <template v-slot:body-actions="props">
        <q-btn flat round icon="edit" @click="editField(props.row)"></q-btn>
        <q-btn flat round icon="delete" @click="deleteField(props)"></q-btn>
      </template>
      <template v-slot:warning>
        <slot name="warning"></slot>
      </template>
    </dynamic-list>

    <free-field :Field="editingFieldField" :values="editingField" @cancel="editorCancelled" @save="saveField"
      @input="editorInput" @update:field="editingFieldChanged"></free-field>
  </div>
</template>

<script>
import { defineComponent, ref, unref, computed } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField.js';
import DynamicList from './DynamicList.js';

const clipBoardStore = {
  content: '',
  items: [],
};

export default defineComponent({
  name: 'FreeFieldList',
  emits:['save', 'delete', 'cancel','paste:fields', 'batch:fields'],
  fieldInfo: {
    DataType: 'Array',
    Category: 'Advanced',
    Label: '字段列表',
    Value: 'FieldList',
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  components: {
    DynamicList,
  },
  setup(props, { emit }) {
    if (!props.Field) return {};

    const { fieldData, getFieldData, setData } = useFreeField(props);

    const showEditor = ref(false);
    const editingField = ref({});
    const changedFields = ref([]);
    const fieldList  = ref(null);

    const editingFieldField = computed(() => ({
      Type: 'FieldEditor',
      Name: '.',
      show: showEditor.value,
    }));

    // watchEffect(() => {
    // });

    // editingFieldField.value = {
    //   Type: 'FieldEditor',
    //   Name: '.',
    //   show: showEditor.value,
    // };

    const localField = computed(() => ({
      Type: 'DynamicList',
      showTop: true,
      Name: props.Field.Name || 'Fields',
      Options: {
        Columns:
          props.Field.Options?.Columns
          || [
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
                style: 'max-width: 300px; min-width: 100px;white-space: wrap; text-align: left;',
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
    }));


    const addField = () => {
      let newIndex = 1;

      const fData = props.Field.Name ? fieldData.value : getFieldData('Fields');

      if (fData?.length) {
        newIndex = fData.map((fd) => fd.Index).sort((a,b) => a.Index-b.Index).filter((fd) => !!fd).pop();
        newIndex = (Number(newIndex) || 0) + 1;
      }

      editingField.value = {
        Index: newIndex,
      };

      showEditor.value = true;
    };
    const saveField = () => {
      if (!editingField.value) return;
      const theField = { ...editingField.value };

      if (theField.isBatchEditing) {
        if (fieldList.value.selected.length > 0) {
          const items = [];
          for (let i = 0; i < fieldList.value.selected.length; i += 1) {
            const item = fieldList.value.selected[i];

            if (item && item.id) {
              items.push(item.id);
            }
          }

          const newFld = {};
          for (let i = 0; i < changedFields.value.length; i += 1) {
            const fld = changedFields.value[i];
            if (fld && theField[fld] !== void 0) {
              newFld[fld] = theField[fld];
            }
          }
          editingField.value = undefined;
          emit(
            'batch:fields',
            { ...newFld, ids: items.join(',') },
          );
        }
      } else {
        if (typeof theField.auto__index === 'undefined') {
          // adding new
          fieldList.value.addRow(theField);
        }

        editingField.value = undefined;

        emit('save', theField);
      }

      showEditor.value = false;
    };
    const deleteField = (p) => {
      fieldList.value.deleteRow(p);
      emit('delete', p.row);
    };
    const copy = () => {
      clipBoardStore.items = [];

      if (
        !fieldList.value
        || !fieldList.value.selected
        || fieldList.value.selected.length <= 0
      ) {
        return;
      }

      const items = [];
      for (let i = 0; i < fieldList.value.selected.length; i += 1) {
        const item = fieldList.value.selected[i];

        if (item) {
          items.push(item.id);
        }
        clipBoardStore.items.push({...unref(item)});
      }

      if (items.length <= 0) return;

      clipBoardStore.content = `EIS_FLOW_FIELD_COPY:${items.join(',')}`;
    };
    const paste = () => {
      // local paste
      if (clipBoardStore.items && clipBoardStore.items.length > 0) {
        const fName = props.Field.Name || 'Fields';
        const fData = props.Field.Name ? fieldData.value : getFieldData('Fields');

        setData(fName, fData.concat(clipBoardStore.items.map((i) => {
          delete i.id;
          delete i.auto__index;
          return i;
        })).sort((a, b) => a.Index - b.Index))
      }

      // emit to parent
      if (
        clipBoardStore.content
        && clipBoardStore.content.startsWith('EIS_FLOW_FIELD_COPY:')
      ) {
        emit(
          'paste:fields',
          clipBoardStore.content.substring('EIS_FLOW_FIELD_COPY:'.length),
          clipBoardStore.items,
        );
      }

      fieldList.value.selected = [];
    };
    const editingFieldChanged = (f) => {
      if (!f) return;
      changedFields.value.push(f);
    };
    const batch = () => {
      if (
        !fieldList.value
        || !fieldList.value.selected
        || fieldList.value.selected.length <= 0
      ) {
        return;
      }

      editingField.value = {
        isBatchEditing: true,
      };
    };

    return {
      fieldData,
      editingField,
      changedFields,
      editingFieldField,
      localField,
      fieldList,
      fieldListLength: computed(() => fieldList.value?.selected?.length),
      addField,
      saveField,
      deleteField,
      copy,
      paste,
      editingFieldChanged,
      batch,

      editField: (row) => {
        editingField.value = row || {};
        showEditor.value = true;
      },
      editorCancelled: () => {
        editingField.value = undefined;
        emit('cancel');
        showEditor.value = false;
      },
      editorInput: () => {
        emit('input');
      },
    };
  },
});
</script>
