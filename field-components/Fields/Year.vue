<template>
  <span class="input-field-year simple-field row items-center no-wrap">
    <q-select
      v-model="fieldData"
      hide-bottom-space
      :options="yearOptions"
      :readonly="Field.ReadOnly"
      @input="$emit('input')"
      :ref="`input_field_validator_${Field.Name || Field.Label}`"
      map-options
      :label="Field.Placeholder"
      emit-value
      v-bind="$attrs"
    >
      <template v-slot:before v-if="typeof Field.Label !== 'undefined'">
        <span
          :class="`field-label ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`">
          <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
          {{Field.Label || ''}}
          <span v-if="Field.Required" class="required-mark">*</span>
        </span>
      </template>
    </q-select>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldYear',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'DateTime',
    Label: '年份',
    Value: 'Year',
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
      {
        Type: 'Boolean',
        Label: '最大至“现在”',
        Name: 'Info.TillNow',
      },
      {
        Type: 'Boolean',
        Label: '最小从“现在”',
        Name: 'Info.FromNow',
      },
      {
        Type: 'DynamicList',
        Label: '选项',
        Name: 'Options',
        Options: {
          Columns: [
            {
              Label: 'Year',
              Name: 'Value',
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
        },
      },
    ],
    Description: '',
  },
  computed: {
    yearOptions() {
      if (this.Field.Type !== 'Year') return [];

      if (this.Field.Options && Array.isArray(this.Field.Options)) {
        return this.Field.Options;
      }

      let minYear = 1900;
      let maxYear = Date.now().year;

      if (this.Field.MinValue && Number(this.Field.MinValue)) {
        minYear = Number(this.Field.MinValue);
      }
      if (this.Field.MaxValue && Number(this.Field.MaxValue)) {
        maxYear = Number(this.Field.MaxValue);
      }

      const options = [];
      for (let i = minYear; i <= maxYear; i += 1) {
        options.push(i);
      }
      return options;
    },
  },
});
</script>
