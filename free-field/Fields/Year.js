import { defineComponent, h, computed } from 'vue';
import { QSelect } from 'quasar';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import freeFieldLabel from '../composible/freeFieldLabel';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldYear',
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
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { emit, slots, expose }){
    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);

    const before = (props.Field.Label !== void 0) ? () => h(freeFieldLabel, {
      Field: props.Field,
    }) : undefined;

    const yearOptions = computed(() => {
      if (props.Field.Type !== 'Year') return [];

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

      const options = [];
      for (let i = minYear; i <= maxYear; i += 1) {
        options.push(i);
      }
      return options;
    });

    const selectNode = computed(() => h(QSelect, {
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,
      'map-options': true,
      label: props.Field.Placeholder,

      class: 'full-width',
      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      options: yearOptions.value,
      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    }, {
      before,
    }));

    const { validate } = useFormValidator(selectNode);
    expose ({
      validate,
    })

    return () => h('div', {
      class: 'simple-field free-field-year row items-center no-wrap',
    }, [
      selectNode.value,
      slots.warning && slots.warning(),
    ]);
  },
});
