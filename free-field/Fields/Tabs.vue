<template>
  <div class="free-field-tabs row no-wrap" v-if="Field">
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

    <div class="col free-field-tabs-tabs-wrapper">
      <q-tabs
        class="tabs"
        v-model="tab"
        :shrink="true"
        no-caps
        :vertical="Field.Options?.vertical || false"
        :align="Field.Options?.align || 'left'"
        :dense="Field.Options?.dense">
        <q-tab
          v-for="(t, idx) in fieldData.value" :key="idx"
          :name="idx"
          :label="t[Field.Options?.LabelField]"
          :dense="Field.Options?.dense">
        </q-tab>
      </q-tabs>
      <q-tab-panels v-model="tab">
        <q-tab-panel
          v-for="(t, idx) in fieldData.value" :key="idx"
          :name="idx">
          <free-field
            :class="`${Field.Options.HideFieldWhenEmpty ? `free-field-tabs-panel-field-${Object.nestValue(t, field.Name) === void 0 ? 'empty' : 'with-value'}` : ''}`"
            v-for="(field, idx) in Field.Options?.Fields"
            :Field="field"
            :values="t"
            :key="idx"
            ref="fieldsToValidate"
            @input="fieldChanged(field)"></free-field>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldTabs',
  fieldInfo: {
    DataType: 'Array',
    Category: 'Container',
    Label: '标签页',
    Value: 'Tabs',
    Extra: [
      {
        Type: 'String',
        Label: '标签字段名',
        Name: 'Options.LabelField',
      },
      {
        Type: 'String',
        Label: '数值字段名',
        Name: 'Options.ValueField',
      },
      {
        Type: 'Boolean',
        Label: '子字段值不存在时隐藏',
        Name: 'Options.HideFieldWhenEmpty',
      },
      {
        Label: '字段',
        Name: 'Options.Fields',
        Type: 'FieldList',
        Options: {
          Columns: [
            {
              Label: '#',
              Name: 'Index',
              sortable: true,
            },
            {
              Label: '类型',
              Name: 'Type',
              style: 'max-width: 120px;',
              sortable: true,
            },
            {
              Label: '名称',
              Name: 'Name',
              style: 'max-width: 200px;',
            },
            {
              Label: '默认',
              Name: 'Default',
              style: 'max-width: 200px;',
            },
            {
              Label: '标题',
              Name: 'Label',
              style: 'max-width: 200px;',
              sortable: true,
            },
          ],
        },
      },
    ],
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { emit }) {
    if(!props.Field) return () => null;

    const { fieldData, setFieldData } = useFreeField(props);
    const { validate } = useFormValidator('fieldsToValidate');

    const tab = ref(0);

    if (!Array.isArray(fieldData.value)) {
      setFieldData([{}], emit)
    }

    if (props.Field.Options?.ValueField && props.Field.Default) {
      const defaultTab = fieldData.value.findIndex((d) => d[props.Field.Options?.ValueField] === props.Field.Default);

      if (defaultTab >= 0) {
        tab.value = defaultTab;
      }
    }

    return {
      tab,
      fieldData,

      fieldChanged: () => {
        emit('input');
      },
      validate,
    };
  },
});
</script>

<style lang="scss" scoped>
.free-field-tabs {
  &-tabs-wrapper {
    margin-left: 12px;
    border: 1px solid rgba($color: #000000, $alpha: 0.12);
    .tabs {
      border-bottom: 1px solid;
    }
  }

  .input-field-tabs-panel-field-empty {
    display: none;
  }
}
</style>
