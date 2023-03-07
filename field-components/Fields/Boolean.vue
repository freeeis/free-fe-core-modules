<template>
  <span class="simple-field input-field-boolean row items-center no-wrap">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.showLabel && !Field.dense && typeof Field.Label !== 'undefined'"
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
    <span v-else-if="!Field.showLabel && !Field.dense" class="field-label-empty"></span>

    <q-toggle
      v-model="fieldData"
      :label="!Field.showLabel ? Field.Label : ''"
      @input="$emit('input')"
      :disable="Field.ReadOnly"
      v-bind="$attrs">
      <q-tooltip v-if="Field.Description">{{Field.Description}}</q-tooltip>
    </q-toggle>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldBoolean',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Simple',
    Label: '开关',
    Value: 'Boolean',
    Extra: [
      {
        Type: 'FixedList',
        Label: '选项',
        Name: 'Options',
        Options: {
          Columns: [
            {
              Label: 'Label',
              Name: 'Label',
              ReadOnly: true,
            },
            {
              Label: 'Value',
              Name: 'Value',
              ReadOnly: true,
            },
            {
              Label: 'Extra',
              Name: 'Extra',
              Type: 'FieldList',
              Options: {
                Columns: [
                  {
                    Label: '#',
                    Name: 'Index',
                  },
                  {
                    Label: '名称',
                    Name: 'Name',
                  },
                  {
                    Label: '标题',
                    Name: 'Label',
                  },
                ],
              },
            },
          ],
          Default: [
            {
              Label: '开',
              Value: true,
              Extra: [],
            },
            {
              Label: '关',
              Value: false,
              Extra: [],
            },
          ],
        },
      },
    ],
    Description: '',
  },
  watch: {
    fieldData() {
      if (!this.fieldData) {
        this.fieldData = false;
      }
    },
  },
  created() {
    if (!this.fieldData) {
      this.fieldData = false;
    }
  },
});
</script>
