<template>
  <div :class="`input-field-radio-list relative-position ${
        this.hasError ? 'input-field--error' : ''}`">
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
            v-model="data[Field.Name]"
            @input="validate(); $emit('input')"
            :val="oValue.Value"
            :disable="Field.ReadOnly"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <div
      class="input-field--error-tag"
      v-if="hasError"
    >
      <e-icon name="error"></e-icon>
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldRadioList',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Simple',
    Label: '展开单选',
    Value: 'RadioList',
    Description: '',
  },
  methods: {
    validate() {
      if (!this.data || !this.Field || !this.Field.Name) {
        this.hasError = false;
        return true;
      }

      this.hasError = typeof this.data[this.Field.Name] === 'undefined';
      return !this.hasError;
    },
  },
});
</script>
