import { defineComponent, h, ref, watchEffect, computed, useAttrs } from 'vue';
import { QInput } from 'quasar';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import ReadonlyContent from '../composible/readonlyContent';
import freeFieldLabel from '../composible/freeFieldLabel';
import { useFormValidator} from '../../composible/useFormValidator';

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
  setup(props, { emit, slots, expose, attrs }){
    if (!props.Field) return {};

    const { proxy:vm } = getCurrentInstance();
    const { fieldData, setFieldData, inputControlSettings } = useFreeField(props);

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

    const inputNode = computed(() => h(QInput, {
      type: 'textarea',
      maxlength: props.Field.Options?.MaxLength,
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,
      rows: rows.value,

      ...inputControlSettings.value,
      placeholder: props.Field?.Placeholder || attrs.placeholder || vm.$t(vm.getModule('core-modules').config['defaultInputFieldPlaceholder']),

      class: 'full-width',
      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    }, {
      before,
    }));

    const { validate } = useFormValidator(inputNode);
    expose ({
      validate,
    })

    return () => h('div', {
      class: 'free-field-text',
    }, [
      slots.warning && h('div', {
        class: props.Field.Label ? 'warning-with-label' : 'warning-without-label',
        style: props.Field.Label ? 'margin-left: var(--field-label-width)' : '',
      }, slots.warning()),
      props.Field.ReadOnly ? readonlyNode() : inputNode.value,
    ]);
  },
});
