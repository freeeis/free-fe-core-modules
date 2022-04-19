<template>
  <span class="simple-field input-field-date row items-center no-wrap">
    <span v-if="Field.ReadOnly">
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
          ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="typeof Field.Label !== 'undefined'">
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content">{{localData}}</span>
    </span>
    <q-input
      v-else
      v-model="localData"
      hide-bottom-space
      :readonly="Field.ReadOnly"
      v-bind="$attrs"
      @input="$emit('input')"
      :ref="`input_field_validator_date`"
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
      <q-popup-proxy
        v-if="!Field.ReadOnly"
        ref="qDateProxy"
        transition-show="scale"
        transition-hide="scale"
      >
        <span class="row">
          <q-date
            v-model="localData"
            v-bind="$attrs"
            :options="dateOptions"
            today-btn
            mask="YYYY-MM-DD"
            :locale="locale"
            @input="() => {$refs.qDateProxy.hide();$emit('input')}"
          />
        </span>
      </q-popup-proxy>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
        </q-icon>
      </template>
    </q-input>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldDate',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'DateTime',
    Label: '日期',
    Value: 'Date',
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
      localData: '',
    };
  },
  watch: {
    fieldData() {
      if (!this.fieldData) {
        this.localData = '';
        return;
      }
      this.localData = this.$options.filters.normalDate(this.fieldData);
    },
    localData() {
      this.fieldData = this.localData;
    },
  },
  computed: {
    locale() {
      return this.ctx.config.locales.find(
        (l) => l.locale === (this.ctx.config.locale || this.ctx.config.defaultLocale),
      ).calendar;
    },
    dateOptions() {
      if (this.Field.Options && (typeof this.Field.Options === 'function' || Array.isArray(this.Field.Options))) return this.Field.Options;

      let minDate = '1900/01/01';
      let maxDate = '2100/12/31';

      if (this.Field.MinValue) {
        minDate = this.Field.MinValue;
      }

      if (this.Field.MaxValue === 'now') {
        maxDate = new Date().toLocaleDateString();
      } else if (this.Field.MaxValue) {
        maxDate = this.Field.MaxValue;
      }

      return (date) => date >= minDate && date <= maxDate;
    },
  },
});
</script>

<style lang="sass" scoped>
.q-field--with-bottom
  padding-bottom: 0
</style>
