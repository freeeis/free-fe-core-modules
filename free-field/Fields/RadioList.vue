<template>
  <div :class="`free-field-radio-list relative-position ${
        this.hasError ? 'free-field--error' : ''}`">
    <slot name="warning"></slot>
    <q-list>
      <q-item
        tag="label"
        :class="`items-center ${(oIndex % 2) ? 'zebra-odd' : 'zebra-even'}`"
        v-ripple
        v-for="(oValue, oIndex) in Field.Options"
        :key="oIndex"
      >
        <q-item-section
          class="icon-section"
          avatar
          top
          v-if="oValue.Image"
        >
          <e-icon
            :relative="!!oValue.relative"
            :name="oValue.Image.id || oValue.Image"
            class="icon"
          ></e-icon>
        </q-item-section>
        <q-item-section class="label-section">
          <q-item-label class="label ellipsis">{{oValue.Label}}</q-item-label>
          <q-item-label
            caption
            class="description ellipsis-3-lines"
          >{{oValue.Description}}</q-item-label>
        </q-item-section>
        <q-item-section
          class="radio-section"
          avatar
          top
        >
          <q-radio
            class="radio"
            v-model="fieldData.value"
            @update:model-value="radioChanged"
            :val="oValue.Value"
            :disable="Field.ReadOnly"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <div
      class="free-field--error-tag"
      v-if="hasError"
    >
      <e-icon name="error"></e-icon>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';

export default defineComponent({
  name: 'InputFieldRadioList',
  fieldInfo: {
    Category: 'Simple',
    Label: '展开单选',
    Value: 'RadioList',
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { expose, emit }) {
    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);
    const hasError = ref(false);

    const validate = () => {
      if (!props.Field.Name) {
        hasError.value = false;
        return true;
      }

      hasError.value = typeof fieldData.value === 'undefined';
      return !hasError.value;
    }

    const radioChanged = (v) => {
      validate();
      setFieldData(v, emit);
    };
    
    expose({
      validate,
    })

    return {
      hasError,
      fieldData,
      setFieldData,
      validate,
      radioChanged,
    };
  },
});
</script>
