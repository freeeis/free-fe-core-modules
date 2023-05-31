import { defineComponent, h, watchEffect } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { QToggle } from 'quasar';
import freeFieldLabel from '../composible/freeFieldLabel';

export default defineComponent({
  name: 'InputFieldBoolean',
  fieldInfo: {
    Category: 'Simple',
    Label: '开关',
    Value: 'Boolean',
    Extra: [
      {
        Type: 'Boolean',
        Label: '显示标签',
        Name: 'Options.ShowLabel',
        Options: {
          ShowLabel: true,
        },
      },
      {
        Type: 'String',
        Label: '右侧标签',
        Name: 'Options.RightLabel',
      },
    ],
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { emit, slots }){
    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);

    watchEffect(() => {
      if (fieldData.value === void 0) {
        setFieldData(props.Field.Default || false);
      }
    })

    const before = (props.Field.Options?.showLabel && !props.Field.dense && props.Field.Label !== void 0) ? () => h(freeFieldLabel, {
      Field: props.Field,
    }) : () => h('div', {
      class: 'field-label-empty'
    });

    const toggleNode = () => h(QToggle, {
      disable: props.Field?.ReadOnly,
      label: props.Field?.Options?.RightLabel || (!props.Field?.Options?.showLabel && props.Field?.Label) ||  '',

      style: props.Field.Info?.Style,

      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    })

    return () => h('div', {
      class: 'simple-field free-field-boolean row items-center no-wrap',
    }, [
      before(),
      toggleNode(),
      slots.warning && slots.warning(),
    ]);
  },
});
