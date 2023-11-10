<template>
  <span class="free-field-number-range simple-field" v-if="Field">
    <span v-if="Field.ReadOnly">
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="Field.Label"
      >
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content">{{fieldData}}</span>
    </span>
    <span v-else class="row items-center no-wrap">
      <q-input
        :readonly="Field.ReadOnly"
        :placeholder="$attrs.placeholder || $t(getModule('field-components').config['defaultInputFieldPlaceholder'])"
        hide-bottom-space
        @update:modelValue="rangeChanged"
        type="number"
        v-model.number="range.min"
        :ref="`input_field_validator_${Field.Name || Field.Label}`"
        :maxlength="maxlength"
        v-bind="inputControlSettings"
      >
        <template
          v-slot:prepend
          v-if="Field.Options && Field.Options.Prefix"
        >
          <span class="prefix">{{Field.Options.Prefix}}</span>
        </template>

        <template
          v-slot:append
          v-if="Field.Options && Field.Options.Postfix"
        >
          <span class="postfix">{{Field.Options.Postfix}}</span>
        </template>
      </q-input>
      <span class="free-field-range-separator">{{`${Field.Separator || '~'}`}}</span>
      <q-input
        :readonly="Field.ReadOnly"
        :placeholder="$attrs.placeholder || $t(getModule('field-components').config['defaultInputFieldPlaceholder'])"
        hide-bottom-space
        @update:modelValue="rangeChanged"
        type="number"
        v-model.number="range.max"
        :ref="`input_field_validator_${Field.Name || Field.Label}2`"
        :maxlength="maxlength"
        v-bind="inputControlSettings"
      >
        <template
          v-slot:prepend
          v-if="Field.Options && Field.Options.Prefix"
        >
          <span class="prefix">{{Field.Options.Prefix}}</span>
        </template>

        <template
          v-slot:append
          v-if="Field.Options && Field.Options.Postfix"
        >
          <span class="postfix">{{Field.Options.Postfix}}</span>
        </template>
      </q-input>
    </span>

    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { freeFieldProps, useFreeField } from '../composible/useFreeField';

export default defineComponent({
  name: 'InputFieldNumberRange',
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  fieldInfo: {
    Category: 'Simple',
    Label: '数字范围',
    Value: 'NumberRange',
    Extra: [
      {
        Type: 'String',
        Label: '最小值',
        Name: 'MinValue',
      },
      {
        Type: 'String',
        Label: '最大值',
        Name: 'MaxValue',
      },
    ],
    Description: '',
  },
  setup(props){
    if (!props.Field) return {};

    const { fieldData, inputControlSettings } = useFreeField(props);
    const range = ref({
      min: 0,
      max: 0,
    });

    return {
      range,
      fieldData,
      inputControlSettings,
    };
  },
  watch: {
    fieldData() {
      const yl = (this.fieldData || '').split(this.Field.Separator || '~');
      [this.range.min, this.range.max] = yl;
    },
  },
  computed: {
    maxlength() {
      if (this.Field && this.Field.Options && this.Field.Options.MaxLength) {
        return this.Field.Options.MaxLength;
      }

      return '';
    },
  },
  methods: {
    rangeChanged() {
      let min = Number(this.range.min);
      let max = Number(this.range.max);
      if (!min && min !== 0 && !max && max !== 0) return;

      const minValue = this.Field.MinValue !== void 0 && Number(this.Field.MinValue) || -Infinity;
      const maxValue = this.Field.MaxValue !== void 0 && Number(this.Field.MaxValue) || Infinity;

      min = Math.max(min, minValue);
      min = Math.min(min, maxValue);

      max = Math.max(max, minValue);
      max = Math.min(max, maxValue);

      this.fieldData = [min, max].join(
        this.Field.Separator || '~',
      );

      this.$emit('input');
    },
  },
});
</script>
