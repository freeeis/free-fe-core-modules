<template>
  <div class="simple-field free-field-value-concat row items-center no-wrap">
    <span class="field-label" v-if="Field.Label !== void 0">
      <q-tooltip v-if="Field.Description" anchor="top right">{{ Field.Description }}</q-tooltip>
      {{ Field.Label || '' }}
    </span>
    <span class="readonly-content">{{ displayValue }}</span>
    <span class="free-field-value-concat-children" aria-hidden="true">
      <free-field
        v-for="(childField, index) in childFields"
        :key="childField.Name || index"
        :Field="{ ...childField, ReadOnly: true }"
        :values="values"
        ref="childFieldRefs"
        @input="refreshDisplayValue"
        @valueToStringChange="refreshDisplayValue"
      ></free-field>
    </span>
    <slot name="warning"></slot>
  </div>
</template>

<script>
import { defineComponent, nextTick, ref, watch } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import FreeField from '../composible/fieldWrapper';

export default defineComponent({
  name: 'InputFieldValueConcat',
  components: {
    FreeField,
  },
  fieldInfo: {
    Category: 'Simple',
    Label: '组合显示',
    Value: 'ValueConcat',
    nesting: [{ path: 'Options.Fields', label: '子字段' }],
    Extra: [
      {
        Type: 'String',
        Label: '分隔符',
        Name: 'Options.Separator',
      },
      {
        Type: 'FieldList',
        Label: '子字段',
        Name: 'Options.Fields',
      },
    ],
    Description: '按顺序拼接子字段的展示值',
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  valueToString(value, Field) {
    const childRefs = this.$refs.childFieldRefs || [];
    const fields = Array.isArray(childRefs) ? childRefs : [childRefs];
    const separator = Field?.Options?.Separator || '';

    return fields
      .map((child) => child?.valueToString?.() || '')
      .join(separator);
  },
  setup(props, { expose }) {
    const { valueToString: fieldValueToString } = useFreeField(props);
    const childFields = ref(props.Field?.Options?.Fields || []);
    const displayValue = ref('');

    const refreshDisplayValue = () => {
      nextTick(() => {
        displayValue.value = fieldValueToString();
      });
    };

    watch(
      () => props.Field?.Options?.Fields,
      (fields) => {
        childFields.value = fields || [];
        refreshDisplayValue();
      },
      { deep: true, immediate: true },
    );

    watch(
      () => props.values,
      refreshDisplayValue,
      { deep: true },
    );

    expose({
      valueToString: fieldValueToString,
    });

    return {
      childFields,
      displayValue,
      refreshDisplayValue,
      valueToString: fieldValueToString,
    };
  },
});
</script>

<style scoped>
.free-field-value-concat-children {
  display: none !important;
  max-height: 0 !important;
  max-width: 0 !important;
}
</style>
