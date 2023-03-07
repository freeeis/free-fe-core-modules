<template>
  <span class="input-field-year-range simple-field">
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
      <q-select
        v-model="range.min"
        hide-bottom-space
        :options="minYearOptions"
        :readonly="Field.ReadOnly"
        v-bind="$attrs"
        @input="rangeChanged"
        :ref="`input_field_validator_first`"
      >
        <template v-slot:before v-if="typeof Field.Label !== 'undefined'">
          <span
            :class="`field-label ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
          >
            <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
            {{Field.Label || ''}}
            <span v-if="Field.Required" class="required-mark">*</span>
          </span>
        </template>
      </q-select>
      <span class="input-field-range-separator">{{`${Field.Separator || '~'}`}}</span>
      <q-select
        v-model="range.max"
        hide-bottom-space
        :options="maxYearOptions"
        :readonly="Field.ReadOnly"
        @input="rangeChanged"
        v-bind="$attrs"
        :ref="`input_field_validator_second`"
      />
    </span>

    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldYearRange',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'DateTime',
    Label: '年份范围',
    Value: 'YearRange',
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
    ],
    Description: '',
  },
  data() {
    return {
      range: {
        min: '',
        max: '',
      },
    };
  },
  watch: {
    fieldData() {
      const yl = (this.fieldData || '').split(this.Field.Separator || '~');
      [this.range.min, this.range.max] = yl;

      // if (!this.range.min) {
      //   this.$set(this.range, 'min', Number(this.Field.MinValue) || 1900);
      // }
      // if (!this.range.max) {
      //   this.$set(this.range, 'max', Number(this.Field.MaxValue)
      //   || (this.Field.TillNow ? Date.now().year : 2050));
      // }
    },
    range() {
      if (this.range.min && this.range.max) return;
      this.fieldData = [this.range.min, this.range.max].join(
        this.Field.Separator || '~',
      );
      this.$emit('input');
    },
  },
  created() {
    // if (!this.range.min) {
    //   this.$set(this.range, 'min', Number(this.Field.MinValue) || 1900);
    // }
    // if (!this.range.max) {
    //   this.$set(this.range, 'max', Number(this.Field.MaxValue)
    //     || (this.Field.TillNow ? Date.now().year : 2050));
    // }
  },
  computed: {
    minYearOptions() {
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

      if (this.range.max && this.range.max < maxYear.toString()) {
        maxYear = Number(this.range.max) - 1;
      }

      const options = [];
      for (let i = minYear; i <= maxYear; i += 1) {
        options.push(i.toString());
      }

      return options;
    },
    maxYearOptions() {
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

      if (this.range.min && this.range.min > minYear.toString()) {
        minYear = Number(this.range.min) + 1;
      }

      const options = [];
      for (let i = minYear; i <= maxYear; i += 1) {
        options.push(i.toString());
      }

      return options;
    },
  },
  methods: {
    rangeChanged() {
      this.fieldData = [this.range.min, this.range.max].join(
        this.Field.Separator || '~',
      );
      this.$emit('input');
    },
  },
});
</script>
