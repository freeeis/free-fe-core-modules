<template>
  <span class="free-field-year-range simple-field">
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
      <span class="readonly-content">{{fieldData.value}}</span>
    </span>
    <span v-else class="row items-center no-wrap">
      <q-select
        v-model="range.min"
        hide-bottom-space
        :options="minYearOptions"
        :readonly="Field.ReadOnly"
        @input="rangeChanged"
        ref="input_field_validator_first"
      >
        <template v-slot:before v-if="Field.Label !== void 0">
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
      <span class="free-field-range-separator">{{`${Field.Separator || '~'}`}}</span>
      <q-select
        v-model="range.max"
        hide-bottom-space
        :options="maxYearOptions"
        :readonly="Field.ReadOnly"
        @input="rangeChanged"
        ref="input_field_validator_second"
      />
    </span>

    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldYearRange',
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
  props: {
    ...freeFieldProps,
  },
  emits:['input'],
  setup(props, { emit, expose }) {
    if (!props.Field) return () => null;

    const { fieldData, setFieldData } = useFreeField(props);

    const min = ref('');
    const max = ref('');

    const rangeChanged = () => {
      setFieldData([min.value, max.value].join(props.Field.Separator || '~'), emit);
    };

    watchEffect(() => {
      const yl = (fieldData.value || '').split(props.Field.Separator || '~');
      min.value = yl[0] && yl[0].trim();
      max.value = yl[1] && yl[1].trim();
    });

    watch(range, () => {
      rangeChanged();
    })

    const minYearOptions = computed(() => {
      if (props.Field.Options && Array.isArray(props.Field.Options)) {
        return props.Field.Options;
      }

      let minYear = 1900;
      let maxYear = Date.now().year;

      if (props.Field.MinValue && Number(props.Field.MinValue)) {
        minYear = Number(props.Field.MinValue);
      }
      if (props.Field.MaxValue && Number(props.Field.MaxValue)) {
        maxYear = Number(props.Field.MaxValue);
      }

      if (max.value && max.value < maxYear.toString()) {
        maxYear = Number(max.value) - 1;
      }

      const options = [];
      for (let i = minYear; i <= maxYear; i += 1) {
        options.push(i.toString());
      }

      return options;
    });

    const maxYearOptions = computed(() => {
      if (props.Field.Options && Array.isArray(props.Field.Options)) {
        return props.Field.Options;
      }

      let minYear = 1900;
      let maxYear = Date.now().year;

      if (props.Field.MinValue && Number(props.Field.MinValue)) {
        minYear = Number(props.Field.MinValue);
      }
      if (props.Field.MaxValue && Number(props.Field.MaxValue)) {
        maxYear = Number(props.Field.MaxValue);
      }

      if (min.value && min.value > minYear.toString()) {
        minYear = Number(min.value) + 1;
      }

      const options = [];
      for (let i = minYear; i <= maxYear; i += 1) {
        options.push(i.toString());
      }

      return options;
    });

    const { validate } = useFormValidator('input_field_validator_first', 'input_field_validator_second');
    expose ({
      validate,
    })

    return {
      fieldData,
      range,

      minYearOptions,
      maxYearOptions,

      rangeChanged,
    };
  },
});
</script>
