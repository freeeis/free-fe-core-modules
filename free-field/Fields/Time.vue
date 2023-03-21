<template>
  <span class="simple-field input-field-time row items-center no-wrap">
    <span v-if="Field.ReadOnly">
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
          ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="Field.Label !== void 0">
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content">{{fieldData.value}}</span>
    </span>
    <q-input v-else v-model="fieldData.value" hide-bottom-space
      :readonly="Field.ReadOnly"
      @input="$emit('input')"
      ref="fieldToValid">
      <template v-slot:before v-if="Field.Label !== void 0">
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
            :modelValue="fieldData.value"
            mask="YYYY-MM-DD HH:mm:ss"
            :hour-options="hourOptions"
            :minute-options="minuteOptions"
            :second-options="secondOptions"
            :options="timeOptions"
            @update:modelValue="changed"
            :locale="locale"
          />
          <q-time
            :modelValue="fieldData.value"
            mask="YYYY-MM-DD HH:mm:ss"
            format24h
            @update:modelValue="changed"
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
import { computed, defineComponent, getCurrentInstance } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldTime',
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
  props: {
    ...freeFieldProps,
  },
  emits:['input'],
  setup(props, { emit, expose }) {
    if (!props.Field) return () => null;

    const { proxy:vm } = getCurrentInstance();

    const { fieldData, setFieldData } = useFreeField(props);

    const locale = vm.ctx.config.locales.find(
      (l) => l.locale === (vm.ctx.config.locale || vm.ctx.config.defaultLocale),
    )?.calendar;


    const hourOptions = computed(() => {
      return objOptions.value ? objOptions.value[0] : undefined;
    });
    const minuteOptions = computed(() => {
      return objOptions.value ? objOptions.value[1] : undefined;
    });
    const secondOptions = computed(() => {
      return objOptions.value ? objOptions.value[2] : undefined;
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

    const { validate } = useFormValidator('fieldToValid');
    expose ({
      validate,
    })

    return {
      fieldData,
      locale,

      hourOptions,
      minuteOptions,
      secondOptions,
      timeOptions,

      changed: (v) => {
        setFieldData(v, emit);
      }
    };
  },
});
</script>
