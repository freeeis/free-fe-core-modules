import { defineComponent, h, computed, getCurrentInstance } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { QInput } from 'quasar';
import ReadonlyContent from '../composible/readonlyContent';
import freeFieldLabel from '../composible/freeFieldLabel';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldString',
  fieldInfo: {
    Category: 'Simple',
    Label: '字符串',
    Value: 'String',
    Extra: [
      {
        Type: 'String',
        Label: '前缀',
        Name: 'Options.Prefix',
      },
      {
        Type: 'String',
        Label: '后缀',
        Name: 'Options.Postfix',
      },
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
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
      },
      {
        Type: 'Labels',
        Label: '类型检查',
        Name: 'rules',
      },
    ],
    Description: '',
    demoField: [{
      Type: 'Category',
      Label: '测试一下字符串',
    },{
      Type: 'String',
      Name: 'MyName',
    }],
    demoData: {
      MyName: 'Tom'
    },
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { emit, slots, expose, attrs }){
    if (!props.Field) return {};

    const { proxy:vm } = getCurrentInstance();
    const { fieldData, setFieldData, inputControlSettings } = useFreeField(props);

    const readonlyNode = () => h(ReadonlyContent, {
      Field: props.Field,
      Content: fieldData.value,
    });

    const before = () => h(freeFieldLabel, {
      Field: props.Field,
    });

    const prepend = slots.prepend ? slots.prepend() : (props.Field.Options?.Prefix && h('span',{
      class: 'prefix',
    }, props.Field.Options?.Prefix));

    const append = slots.append ? slots.append() : (props.Field.Options?.Postfix && h('span',{
      class: 'postfix',
    }, props.Field.Options?.Postfix));

    const inputNode = computed(() => h(QInput, {
      maxlength: props.Field.Options?.MaxLength,
      autocomplete: 'off',
      // bottomSlots: true,
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,

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
      prepend,
      append,
    }));

    const { validate } = useFormValidator(inputNode.value);
    expose({
      validate,
    })

    return () => h('div', {
      class: 'simple-field free-field-string row items-center no-wrap',
    }, [
      props.Field.ReadOnly ? readonlyNode() : inputNode.value,
      slots.warning && slots.warning(),
    ]);
  },
});
