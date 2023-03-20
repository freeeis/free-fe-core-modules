import { defineComponent, h, ref, watchEffect } from 'vue';
import { useFreeField, freeFieldProps, useFreeFieldMethods } from '../components/useFreeField';
import { QInput } from 'quasar';
import ReadonlyContent from '../components/readonlyContent';
import freeFieldLabel from '../components/freeFieldLabel';

export default defineComponent({
  name: 'InputFieldText',
  fieldInfo: {
    Category: 'Simple',
    Label: '文本',
    Value: 'Text',
    Extra: [
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
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

    const rows = ref(3);

    watchEffect(()  => {
      const fVal = fieldData.value;
      const contentLines = (fVal && typeof fVal === 'string') ? Math.max((fVal.match(/\n/g) || '').length + 1, fVal.length / 20) : 8;
      rows.value = (props.Field.ReadOnly) ? Math.min(contentLines, 20) : 8;
    })

    const readonlyNode = () => h(ReadonlyContent, {
      Field: props.Field,
      Content: fieldData.value,
    });

    const before = () => h(freeFieldLabel, {
      Field: props.Field,
    });

    const inputNode = () => h(QInput, {
      type: 'textarea',
      maxlength: props.Field.Options?.MaxLength,
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,
      rows: rows.value,

      class: 'full-width',
      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    }, {
      before,
    });

    return () => h('div', {
      class: 'input-field-text',
    }, [
      slots.warning && h('div', {
        class: props.Field.Label ? 'warning-with-label' : 'warning-without-label',
      }, slots.warning()),
      props.Field.ReadOnly ? readonlyNode() : inputNode(),
    ]);
  },
});
