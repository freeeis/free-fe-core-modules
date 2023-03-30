import { defineComponent, h, watch, computed } from 'vue';
import { QInput } from 'quasar';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import ReadonlyContent from '../composible/readonlyContent';
import freeFieldLabel from '../composible/freeFieldLabel';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldNumber',
  fieldInfo: {
    Category: 'Simple',
    Label: '数字',
    Value: 'Number',
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
        Type: 'Number',
        Label: '最小值',
        Name: 'MinValue',
      },
      {
        Type: 'Number',
        Label: '最大值',
        Name: 'MaxValue',
      },
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
      },
      {
        Type: 'DynamicList',
        Label: '附加字段',
        Name: 'Options.Extra',
        Options: {
          Columns: [
            {
              Label: '值范围',
              Name: 'Value',
              Type: 'Labels',
              Options: {
                Batch: true,
              },
            },
            {
              Label: '不在其中时',
              Type: 'Boolean',
              Name: 'WhenNotIn',
              Default: false,
            },
            {
              Label: '字段',
              Name: 'List',
              Type: 'FieldList',
              Options: {
                Columns: [
                  {
                    Label: '#',
                    Name: 'Index',
                    sortable: true,
                  },
                  {
                    Label: '名称',
                    Name: 'Name',
                    style: 'max-width: 200px;',
                    sortable: true,
                  },
                  {
                    Label: '标题',
                    Name: 'Label',
                    style: 'max-width: 200px;',
                    sortable: true,
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
  setup(props, { emit, slots , expose }){
    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);

    // keep between the min and max value
    watch(fieldData, (d) => {
      if (!d) return;

      if (!Number(d) && Number(d) !== 0) return;

      let v = d;
      if (props.Field.MinValue !== void 0 && Number(props.Field.MinValue) > v) {
        v = Number(props.Field.MinValue);
      }
      if (props.Field.MaxValue !== void 0 && Number(props.Field.MaxValue) < v) {
        v = Number(props.Field.MaxValue);
      }

      setFieldData(Number(v));
    })

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
      type: 'number',
      maxlength: props.Field.Options?.MaxLength,
      autocomplete: 'off',
      // bottomSlots: true,
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,

      class: 'full-width',
      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(Number(v), emit);
      },
    }, {
      before,
      prepend,
      append,
    }));

    const { validate } = useFormValidator(inputNode);
    expose({
      validate,
    })

    return () => h('div', {
      class: 'simple-field input-field-number row items-center no-wrap',
    }, [
      props.Field.ReadOnly ? readonlyNode() : inputNode.value,
      slots.warning && slots.warning(),
    ]);
  },
});
