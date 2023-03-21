import { defineComponent, h, ref } from 'vue';
import { useFreeField, freeFieldProps, useFreeFieldMethods } from '../composible/useFreeField';
import { QCheckbox } from 'quasar';
import freeFieldLabel from '../composible/freeFieldLabel';

export default defineComponent({
  name: 'InputFieldCheck',
  fieldInfo: {
    Category: 'Simple',
    Label: '勾选',
    Value: 'Check',
    Extra: [
      {
        Type: 'FixedList',
        Label: '选项',
        Name: 'Options',
        Options: {
          Columns: [
            {
              Label: 'Label',
              Name: 'Label',
              ReadOnly: true,
            },
            {
              Label: 'Value',
              Name: 'Value',
              ReadOnly: true,
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
          Default: [
            {
              Label: '选中',
              Value: true,
              Extra: [],
            },
            {
              Label: '未选',
              Value: false,
              Extra: [],
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
  methods: {
    ...useFreeFieldMethods,
  },
  setup(props, { emit, slots }){
    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);

    const before = (props.Field.showLabel && !props.Field.dense && props.Field.Label !== void 0) ? () => h(freeFieldLabel, {
      Field: props.Field,
    }) : () => h('div', {
      class: 'field-label-empty'
    });

    const checkboxNode = () => h(QCheckbox, {
      disable: props.Field?.ReadOnly,
      label: props.Field?.showLabel ? '' : props.Field?.Label,

      style: props.Field.Info?.Style,

      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    })

    return () => h('div', {
      class: 'simple-field input-field-check row items-center no-wrap',
    }, [
      before(),
      checkboxNode(),
      slots.warning && slots.warning(),
    ]);
  },
});
