<template>
  <span class="simple-field input-field-date-range row items-center no-wrap">
    <span v-if="Field.ReadOnly">
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="typeof Field.Label !== 'undefined'"
      >
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content">{{fieldData}}</span>
    </span>
    <span v-else class="row items-center no-wrap">
      <span v-if="typeof Field.Label !== 'undefined'" class="q-field__before">
        <span
          :class="`field-label ${(Field.Label && Field.Label.trim().length)
          ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        >
          <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
          {{Field.Label || ''}}
          <span v-if="Field.Required" class="required-mark">*</span>
        </span>
      </span>
      <q-input
        v-model="min"
        hide-bottom-space
        v-bind="$attrs"
        :readonly="Field.ReadOnly"
        :ref="`input_field_validator_first`"
      >
        <q-popup-proxy
          v-if="!Field.ReadOnly"
          ref="qDateProxy1"
          transition-show="scale"
          transition-hide="scale"
        >
          <span class="row">
            <q-date
              v-model="min"
              :options="minDateOptions"
              today-btn
              :locale="locale"
              mask="YYYY-MM-DD"
              @input="inputChanged('qDateProxy1')"
            />
          </span>
        </q-popup-proxy>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer"></q-icon>
        </template>
      </q-input>

      <span class="input-field-range-separator">{{`${Field.Separator || '~'}`}}</span>

      <q-input
        v-model="max"
        v-bind="$attrs"
        hide-bottom-space
        :readonly="Field.ReadOnly"
        :ref="`input_field_validator_second`"
      >
        <q-popup-proxy
          v-if="!Field.ReadOnly"
          ref="qDateProxy2"
          transition-show="scale"
          transition-hide="scale"
        >
          <span class="row">
            <q-date
              v-model="max"
              :options="maxDateOptions"
              today-btn
              :locale="locale"
              mask="YYYY-MM-DD"
              @input="inputChanged('qDateProxy2')"
            />
          </span>
        </q-popup-proxy>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer"></q-icon>
        </template>
      </q-input>
    </span>

    <slot name="warning"></slot>
  </span>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldDateRange',
  mixins: [mixins.InputFieldMixin],
  emits: ['input'],
  fieldInfo: {
    Category: 'DateTime',
    Label: '日期范围',
    Value: 'DateRange',
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
      min: '',
      max: '',
    };
  },
  watch: {
    fieldData() {
      const yl = (this.fieldData || '').split(this.Field.Separator || '~');
      this.min = yl[0] && yl[0].trim();
      this.max = yl[1] && yl[1].trim();
    },
  },
  computed: {
    locale() {
      return this.ctx.config.locales.find(
        (l) => l.locale === (this.ctx.config.locale || this.ctx.config.defaultLocale),
      ).calendar;
    },
    minDateOptions() {
      // if (this.Field.Options) return this.Field.Options;

      let minDate = '1900/01/01';
      let maxDate = '2050/12/31';

      if (this.Field.MinValue) {
        minDate = this.Field.MinValue.replace(/-/g, '/');
      }

      if (this.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (this.Field.MaxValue) {
        maxDate = this.Field.MaxValue.replace(/-/g, '/');
      }

      if (this.max && this.max.replace(/-/g, '/') < maxDate) return (date) => date >= minDate && date < this.max.replace(/-/g, '/');

      return (date) => date >= minDate && date <= maxDate;
    },
    maxDateOptions() {
      // if (this.Field.Options) return this.Field.Options;

      let minDate = '1900/01/01';
      let maxDate = '2050/12/31';

      if (this.Field.MinValue) {
        minDate = this.Field.MinValue.replace(/-/g, '/');
      }

      if (this.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (this.Field.MaxValue) {
        maxDate = this.Field.MaxValue.replace(/-/g, '/');
      }

      if (this.min && this.min.replace(/-/g, '/') > minDate) {
        return (date) => date > this.min.replace(/-/g, '/') && date <= maxDate;
      }

      return (date) => date >= minDate && date <= maxDate;
    },
  },
  methods: {
    inputChanged(n) {
      if (!n) return;

      this.$refs[n].hide();
      this.fieldData = [this.min, this.max].join(this.Field.Separator || '~');
      this.$emit('input');
    },
  },
});
</script>
