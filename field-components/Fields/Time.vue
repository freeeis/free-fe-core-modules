<template>
  <span class="simple-field input-field-time row items-center no-wrap">
    <span v-if="Field.ReadOnly">
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
          ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="typeof Field.Label !== 'undefined'">
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content">{{fieldData}}</span>
    </span>
    <q-input v-else v-model="fieldData" hide-bottom-space
      :readonly="Field.ReadOnly"
      v-bind="$attrs" @input="$emit('input')"
      :ref="`input_field_validator_${Field.Name || Field.Label}`">
      <template v-slot:before v-if="typeof Field.Label !== 'undefined'">
        <span
          :class="`field-label ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`">
          <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
          {{Field.Label || ''}}
          <span v-if="Field.Required" class="required-mark">*</span>
        </span>
      </template>
      <q-popup-proxy v-if="!Field.ReadOnly" transition-show="scale" transition-hide="scale">
        <span class="row">
          <q-date
            v-model="fieldData"
            mask="YYYY-MM-DD HH:mm:ss"
            :hour-options="hourOptions"
            :minute-options="minuteOptions"
            :second-options="secondOptions"
            :options="timeOptions"
            @input="$emit('input')"
            :locale="locale"
          />
          <q-time
            v-model="fieldData"
            mask="YYYY-MM-DD HH:mm:ss"
            format24h
            @input="$emit('input')"
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
  name: 'InputFieldTime',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'DateTime',
    Label: '时间',
    Value: 'Time',
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
    return {};
  },
  computed: {
    locale() {
      return this.ctx.config.locales.find(
        (l) => l.locale === (this.ctx.config.locale || this.ctx.config.defaultLocale),
      ).calendar;
    },
    hourOptions() {
      return this.objOptions ? this.objOptions[0] : undefined;
    },
    minuteOptions() {
      return this.objOptions ? this.objOptions[1] : undefined;
    },
    secondOptions() {
      return this.objOptions ? this.objOptions[2] : undefined;
    },
    objOptions() {
      if (this.Field.Options) {
        return this.Field.Options;
      }
      return undefined;
    },
    timeOptions() {
      if (this.objOptions) return undefined;

      if (!this.Field.MinValue && !this.Field.MaxValue) {
        return undefined;
      }

      let minH;
      let minM;
      let minS;

      if (this.Field.MinValue) {
        [minH, minM, minS] = this.Field.MinValue;
      }

      let maxH;
      let maxM;
      let maxS;
      if (this.Field.MaxValue) {
        [maxH, maxM, maxS] = this.Field.MaxValue;
      }

      minH = minH || 0;
      minM = minM || 0;
      minS = minS || 0;

      maxH = maxH || 24;
      maxM = maxM || 60;
      maxS = maxS || 60;

      return (hr, min, sec) => {
        if (hr < minH || hr > maxH) {
          return false;
        }
        if (min < minM || min > maxM) {
          return false;
        }
        if (sec < minS || sec > maxS) {
          return false;
        }
        return true;
      };
    },
  },
});
</script>
