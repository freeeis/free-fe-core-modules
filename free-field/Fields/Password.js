import { defineComponent, h, ref, computed } from 'vue';
import { QInput, QIcon } from 'quasar';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import freeFieldLabel from '../composible/freeFieldLabel';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldPassword',
  fieldInfo: {
    Category: 'Simple',
    Label: '密码',
    Value: 'Password',
    Description: '',
    Extra: [
      {
        Type: 'Boolean',
        Label: '自动填入',
        Name: 'Options.autocomplete',
        Default: 'false',
      },
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
      },
    ],
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { emit, slots, expose }){
    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);
    const isPwd = ref(true);

    const before = () => h(freeFieldLabel, {
      Field: props.Field,
    });

    const append = () => h(QIcon,{
      class: 'cursor-pointer',
      name: isPwd.value ? 'visibility_off' : 'visibility',
      onClick: () => {
        isPwd.value = !isPwd.value;
      },
    });

    const inputNode = computed(() => h(QInput, {
      type: isPwd.value ?  'password' : 'text',
      maxlength: props.Field.Options?.MaxLength,
      autocomplete: props.Field.Options?.autocomplete ? '' : 'new-password',
      // bottomSlots: true,
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,

      class: 'full-width',
      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    }, {
      before,
      append,
    }));

    const { validate } = useFormValidator(inputNode);
    expose({
      validate,
    })

    return () => h('div', {
      class: 'simple-field input-field-password row items-center no-wrap',
    }, [
      inputNode.value,
      slots.warning && slots.warning(),
    ]);
  },
});
