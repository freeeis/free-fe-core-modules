<template>
  <span class="simple-field input-field-check row items-center no-wrap">
    <span>
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

      <q-checkbox
        @input="$emit('input')"
        :disable="Field.ReadOnly"
        v-bind="$attrs"
        :label="!Field.showLabel ? Field.Label : ''"
        v-model="fieldData"
      />
    </span>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldCheck',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Simple',
    Label: '勾选',
    Value: 'Check',
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
              Label: '选中',
              Value: true,
              Extra: [],
            },
            {
              Label: '未选',
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
  methods: {
    validate() {
      if (this.Field.Required) return typeof this.fieldData !== 'undefined';

      const rules = Array.isArray(typeof this.Field.Rules) ? this.Field.Rules : [this.Field.Rules];

      let isValid = true;
      for (let i = 0; i < rules.length; i += 1) {
        const r = rules[i];

        if (typeof r === 'function') {
          isValid = isValid && r(this.fieldData);
        }
      }

      return isValid;
    },
  },
});
</script>
