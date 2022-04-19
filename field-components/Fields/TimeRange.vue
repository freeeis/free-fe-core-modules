<template>
  <span class="simple-field input-field-time-range row items-center no-wrap">
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
        v-bind="$attrs"
        hide-bottom-space
        :readonly="Field.ReadOnly"
        :ref="`input_field_validator_first`"
      >
        <q-popup-proxy
          v-if="!Field.ReadOnly"
          ref="qDateProxy1"
          transition-show="scale"
          transition-hide="scale"
        >
          <span class="row" style="min-width: 580px;">
            <q-date
              v-model="min"
              :options="minDateOptions"
              mask="YYYY-MM-DD HH:mm"
              :locale="locale"
            />
            <q-time
              v-model="min"
              mask="YYYY-MM-DD HH:mm"
              :hour-options="minHourOptions"
              :minute-options="minMinuteOptions"
              :options="timeOptions"
              format24h />
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
          ref="qDateProxy1"
          transition-show="scale"
          transition-hide="scale"
        >
          <span class="row" style="min-width: 580px;">
            <q-date
              v-model="max"
              :options="maxDateOptions"
              mask="YYYY-MM-DD HH:mm"
              :locale="locale"
            />
            <q-time
              v-model="max"
              mask="YYYY-MM-DD HH:mm"
              :hour-options="maxHourOptions"
              :minute-options="maxMinuteOptions"
              :options="timeOptions"
              format24h />
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
  name: 'InputFieldTimeRange',
  mixins: [mixins.InputFieldMixin],
  emits:['input'],
  fieldInfo: {
    Category: 'DateTime',
    Label: '时间范围',
    Value: 'TimeRange',
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
        Type: 'Select',
        Label: '小时可选',
        Name: 'Options.hour',
        Placeholder: '请选择',
        Multiple: true,
        Options: new Array(25).fill('').map((item, index) => ({
          Label: `${index}`,
          Value: index,
        })),
      },
      {
        Type: 'Select',
        Label: '分钟可选',
        Name: 'Options.minute',
        Placeholder: '请选择',
        Multiple: true,
        Options: new Array(61).fill('').map((item, index) => ({
          Label: `${index}`,
          Value: index,
        })),
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
    min() {
      this.fieldData = [this.min, this.max].join(this.Field.Separator || '~');
      this.$emit('input');
    },
    max() {
      this.fieldData = [this.min, this.max].join(this.Field.Separator || '~');
      this.$emit('input');
    },
  },
  computed: {
    locale() {
      return this.ctx.config.locales.find(
        (l) => l.locale === (this.ctx.config.locale || this.ctx.config.defaultLocale),
      ).calendar;
    },
    minDateOptions() {
      let minDate = '1900/01/01';
      let maxDate = '2050/12/31';

      if (this.Field.MinValue) {
        minDate = this.Field.MinValue.replace(/-/g, '/');
        [minDate] = minDate.split(' ');
      }

      if (this.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (this.Field.MaxValue) {
        maxDate = this.Field.MaxValue.replace(/-/g, '/');
        [maxDate] = maxDate.split(' ');
      }

      if (this.max && this.max.replace(/-/g, '/') < maxDate) {
        return (date) => date >= minDate && date <= this.max.replace(/-/g, '/').split(' ')[0];
      }

      return (date) => date >= minDate && date <= maxDate;
    },
    maxDateOptions() {
      let minDate = '1900/01/01';
      let maxDate = '2050/12/31';

      if (this.Field.MinValue) {
        minDate = this.Field.MinValue.replace(/-/g, '/');
        [minDate] = minDate.split(' ');
      }

      if (this.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (this.Field.MaxValue) {
        maxDate = this.Field.MaxValue.replace(/-/g, '/');
        [maxDate] = maxDate.split(' ');
      }

      if (this.min && this.min.replace(/-/g, '/') > minDate) {
        return (date) => date >= this.min.replace(/-/g, '/').split(' ')[0] && date <= maxDate;
      }

      return (date) => date >= minDate && date <= maxDate;
    },
    minTimeLimit() {
      if (this.min && this.Field.MinValue) {
        try {
          const dSplit = this.Field.MinValue.split(' ');
          const mD = dSplit[0];

          if (this.min.split(' ')[0] <= mD) {
            const [mH, mM] = dSplit[1].split(':');

            if (mH && mM) {
              return {
                hour: (t) => t >= Number(mH),
                minute: (t) => t >= 0, // Number(mM),
              };
            }
          }
        } catch {
          //
        }
      }

      return {
        hour: (t) => t >= 0,
        minute: (t) => t >= 0,
      };
    },
    maxTimeLimit() {
      if (this.max && this.Field.MaxValue) {
        try {
          const dSplit = this.Field.MaxValue.split(' ');
          const mD = dSplit[0];

          if (this.max.split(' ')[0] >= mD) {
            const [mH, mM] = dSplit[1].split(':');

            if (mH && mM) {
              return {
                hour: (t) => t <= Number(mH),
                minute: (t) => t >= 0, // <= Number(mM),
              };
            }
          }
        } catch {
        //
        }
      }

      return {
        hour: (t) => t >= 0,
        minute: (t) => t >= 0,
      };
    },
    minHourOptions() {
      return this.objOptions
        ? (this.objOptions.hour || []).filter(this.minTimeLimit.hour) : undefined;
    },
    minMinuteOptions() {
      return this.objOptions
        ? (this.objOptions.minute || []).filter(this.minTimeLimit.minute) : undefined;
    },
    maxHourOptions() {
      return this.objOptions
        ? (this.objOptions.hour || []).filter(this.maxTimeLimit.hour) : undefined;
    },
    maxMinuteOptions() {
      return this.objOptions
        ? (this.objOptions.minute || []).filter(this.maxTimeLimit.minute) : undefined;
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
