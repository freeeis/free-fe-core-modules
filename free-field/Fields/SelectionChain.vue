<template>
  <div class="input-field-select-chain row items-start no-wrap">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.Label !== void 0"
    >
      <q-tooltip
        v-if="Field.Description"
        anchor="top right"
      >{{Field.Description}}</q-tooltip>
      {{Field.Label || ''}}
      <span
        v-if="Field.Required"
        class="required-mark"
      >*</span>
    </span>
    <span style="margin-left: 12px;">
      <slot name="warning"></slot>
      <span
        v-if="Field && Field.Options && Field.Options.Fields && !Field.ReadOnly"
        class="row q-gutter-sm no-wrap"
      >
        <q-select
          class="simple-field"
          hide-bottom-space
          v-for="(option, index) in Field.Options.Fields"
          :key="index"
          v-model="valuesList[index]"
          :options="optionsList[index]"
          option-value="Value"
          option-label="Label"
          map-options
          :label="valuesList[index] ? '' : option.Placeholder"
          emit-value
          @input="selectionChanged(index)"
          :ref="`input_field_validator_${index}`"
        ></q-select>
      </span>
      <span v-if="Field && Field.ReadOnly">
        <span
          class="readonly-content"
          v-for="(option, index) in Field.Options.Fields"
          :key="index"
        >
          <span v-if="valuesList[index] && !option.Hide">
            {{optionsList[index] ?
                (optionsList[index].find(o => o.Value === valuesList[index]) || {}).Label : ''}}
          </span>
        </span>
      </span>
    </span>
  </div>
</template>

<script>
import { defineComponent, ref, watch, getCurrentInstance, } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';

export default defineComponent({
  name: 'InputFieldSelectChain',
  props: {
    ...freeFieldProps,
  },
  emits:['input'],
  fieldInfo: {
    Category: 'Advanced',
    Label: '选择链',
    Value: 'SelectionChain',
    Extra: [
      {
        Type: 'String',
        Label: '数据获取地址',
        Name: 'Options.Url',
      },
      {
        Type: 'String',
        Label: '上级数据名',
        Name: 'Options.ParentName',
      },
      {
        Type: 'String',
        Label: '数据名',
        Name: 'Options.DataName',
      },
      {
        Type: 'DynamicList',
        Label: '列',
        Name: 'Options.Fields',
        Options: {
          Columns: [
            {
              Label: 'Name',
              Name: 'Name',
            },
            {
              Label: 'Placeholder',
              Name: 'Placeholder',
            },
            {
              Label: 'Default',
              Name: 'Default',
            },
            {
              Label: 'Hide',
              Name: 'Hide',
              Type: 'Boolean',
              Default: false,
            },
          ],
        },
      },
    ],
    Description: '',
  },
  setup(props, { emit }) {
    if (!props.Field) return () => null;

    const { proxy:vm } = getCurrentInstance();

    const { fieldData, setFieldData } = useFreeField(props);

    const optionsList = ref([]);
    const valuesList = ref([]);

    const getOptions = (index) => {
      if (!props.Field.Options?.Fields) {
        return;
      }

      if (index > 0 && !valuesList.value[index - 1]) return;

      if(props.Field.Options?.Url){
        const obj = {};
        obj[props.Field.Options.ParentName] = props.Field.Options.Fields[index - 1]
          ? valuesList.value.slice(0, index).join('.')
          : '';

        vm.getRequest(props.Field.Options.Url, obj).then((d) => {
          if (d && d.msg === 'OK') {
            const dd = props.Field.Options?.DataName ? Object.nestValue(d.data, props.Field.Options.DataName) : d.data;

            if (Array.isArray(dd)) {
              optionsList.value[index] = dd;
            }
          }
        });
      } else if(props.Field.Options.Data){
        let parent = props.Field.Options.Fields[index - 1]
          ? valuesList.value.slice(0, index).join('.')
          : '';

        parent = parent && parent.split('.');
        parent = parent && parent.pop();
        parent = parent || '';

        optionsList.value[index] = props.Field.Options.Data.filter(dd => dd[props.Field.Options.ParentName] === parent);
      }
    };

    const initOptions = () => {
      if (optionsList.value.length > 0) return;

      if (props.Field.Options?.Fields) {
        for (let i = 0; i < props.Field.Options.Fields.length; i += 1) {
          const fld = props.Field.Options.Fields[i];

          if (fieldData.value) {
            fieldData.value[fld.Name] = fieldData.value[fld.Name] || fld.Default || '';
          }

          valuesList.value[i] = fieldData.value && fieldData.value[fld.Name];
          if (i === 0 || valuesList.value[i - 1]) {
            getOptions(i);
          }
        }
      }
    };

    const selectionChanged = (index) => {
      setFieldData(fieldData.value || {});

      if (index < props.Field.Options?.Fields?.length - 1) {
        for (let i = index + 1; i < props.Field.Options.Fields.length; i += 1) {
          delete valuesList.value[i];
          delete optionsList.value[i];
          fieldData.value[props.Field.Options.Fields[i].Name] = '';
        }
        getOptions(index + 1);
      }

      fieldData.value[props.Field.Options.Fields[index].Name] = valuesList.value[
        index
      ];
      emit('input');
    };

    watch(fieldData, () => {
      if(typeof fieldData.value === 'undefined'){
        valuesList.value = [];
      }
      initOptions();
    });

    return {
      fieldData,
      setFieldData,
      initOptions,

      optionsList,
      valuesList,

      selectionChanged,
    };
  },
  created() {
    this.initOptions();
  },
});
</script>
