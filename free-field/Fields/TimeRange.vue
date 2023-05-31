<template>
  <span class="simple-field free-field-time-range row items-center no-wrap">
    <span v-if="Field.ReadOnly">
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="Field.Label !== void 0"
      >
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content">{{fieldData.value}}</span>
    </span>
    <span v-else class="row items-center no-wrap">
      <span v-if="Field.Label !== void 0" class="q-field__before">
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
        :readonly="Field.ReadOnly"
        ref="input_field_validator_first"
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

      <span class="free-field-range-separator">{{`${Field.Separator || '~'}`}}</span>

      <q-input
        v-model="max"
        hide-bottom-space
        :readonly="Field.ReadOnly"
        ref="input_field_validator_second"
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
import { defineComponent, ref, getCurrentInstance, watch, watchEffect, computed } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldTimeRange',
  props: {
    ...freeFieldProps,
  },
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
  setup(props, { emit, expose }) {
    if (!props.Field) return () => null;

    const { proxy:vm } = getCurrentInstance();

    const { fieldData, setFieldData } = useFreeField(props);

    const updateFieldDate = () => {
      setFieldData([min.value, max.value].join(props.Field.Separator || '~'), emit);
    };

    const min = ref('');
    const max = ref('');

    watch(min, () => updateFieldDate());
    watch(max, () => updateFieldDate());

    watchEffect(() => {
      const yl = (fieldData.value || '').split(props.Field.Separator || '~');
      min.value = yl[0] && yl[0].trim();
      max.value = yl[1] && yl[1].trim();
    });

    const locale = vm.ctx.config.locales.find(
      (l) => l.locale === (vm.ctx.config.locale || vm.ctx.config.defaultLocale),
    )?.calendar;


    const minDateOptions = computed(() => {
      let minDate = '1900/01/01';
      let maxDate = '2050/12/31';

      if (props.Field.MinValue) {
        minDate = props.Field.MinValue.replace(/-/g, '/');
        [minDate] = minDate.split(' ');
      }

      if (props.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (props.Field.MaxValue) {
        maxDate = props.Field.MaxValue.replace(/-/g, '/');
        [maxDate] = maxDate.split(' ');
      }

      if (max.value && max.value.replace(/-/g, '/') < maxDate) {
        return (date) => date >= minDate && date <= max.value.replace(/-/g, '/').split(' ')[0];
      }

      return (date) => date >= minDate && date <= maxDate;
    });
    const maxDateOptions = computed(() => {
      let minDate = '1900/01/01';
      let maxDate = '2050/12/31';

      if (props.Field.MinValue) {
        minDate = props.Field.MinValue.replace(/-/g, '/');
        [minDate] = minDate.split(' ');
      }

      if (props.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (props.Field.MaxValue) {
        maxDate = props.Field.MaxValue.replace(/-/g, '/');
        [maxDate] = maxDate.split(' ');
      }

      if (min.value && min.value.replace(/-/g, '/') > minDate) {
        return (date) => date >= min.value.replace(/-/g, '/').split(' ')[0] && date <= maxDate;
      }

      return (date) => date >= minDate && date <= maxDate;
    });
    const minTimeLimit = computed(() => {
      if (min.value && props.Field.MinValue) {
        try {
          const dSplit = props.Field.MinValue.split(' ');
          const mD = dSplit[0];

          if (min.value.split(' ')[0] <= mD) {
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
    });
    const maxTimeLimit = computed(() => {
      if (max.value && props.Field.MaxValue) {
        try {
          const dSplit = props.Field.MaxValue.split(' ');
          const mD = dSplit[0];

          if (max.value.split(' ')[0] >= mD) {
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
    });
    const minHourOptions = computed(() => {
      return objOptions.value
        ? (objOptions.value.hour || []).filter(minTimeLimit.value.hour) : undefined;
    });
    const minMinuteOptions = computed(() => {
      return objOptions.value
        ? (objOptions.value.minute || []).filter(minTimeLimit.value.minute) : undefined;
    });
    const maxHourOptions = computed(() => {
      return objOptions.value
        ? (objOptions.value.hour || []).filter(maxTimeLimit.value.hour) : undefined;
    });
    const maxMinuteOptions = computed(() => {
      return objOptions.value
        ? (objOptions.value.minute || []).filter(maxTimeLimit.value.minute) : undefined;
    });

    const objOptions = computed(() => props.Field.Options || undefined);

    const timeOptions = computed(() => {
      if (objOptions.value) return undefined;

      if (!props.Field.MinValue && !props.Field.MaxValue) {
        return undefined;
      }

      let minH;
      let minM;
      let minS;

      if (props.Field.MinValue) {
        [minH, minM, minS] = props.Field.MinValue;
      }

      let maxH;
      let maxM;
      let maxS;
      if (props.Field.MaxValue) {
        [maxH, maxM, maxS] = props.Field.MaxValue;
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
    });

    const { validate } = useFormValidator('input_field_validator_first', 'input_field_validator_second');
    expose ({
      validate,
    })

    return {
      min,
      max,
      fieldData,
      locale,

      minDateOptions,
      maxDateOptions,
      minHourOptions,
      minMinuteOptions,
      maxHourOptions,
      maxMinuteOptions,
      timeOptions,

      changed: (v) => {
        setFieldData(v, emit);
      }
    };
  },
});
</script>
