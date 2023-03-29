import { defineComponent, getCurrentInstance, h, ref, watchEffect } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import ReadonlyContent from '../composible/readonlyContent';

export default defineComponent({
  name: 'InputFieldApiCall',
  fieldInfo: {
    Category: 'Advanced',
    Label: '特定接口处理',
    Value: 'ApiCall',
    Extra: [
      {
        Type: 'String',
        Label: '数据获取地址',
        Name: 'Options.Url',
      },
      {
        Type: 'Select',
        Label: '调用方法',
        Name: 'Options.Method',
        Options: [
          'get',
          'post',
          'put',
          'delete',
          'patch',
        ],
      },
      {
        Type: 'String',
        Label: '传送字段名',
        Name: 'Options.Fields',
        Placeholder: '逗号分割',
        Tips: [
          {
            Text: '默认将传送当前字段数据，但可以指定相同数据层级下的其他字段。',
          },
        ],
      },
      {
        Type: 'String',
        Label: '附加字段名',
        Name: 'Options.ExtraFieldNames',
        Placeholder: '逗号分割',
        Tips: [
          {
            Text: '如果接口返回值中有这些字段，他们将会被赋予当前父数据中。',
          },
        ],
      },
    ],
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  setup(props, { slots }){
    if (!props.Field) return {};

    const { proxy:vm } = getCurrentInstance();
    const { fieldData } = useFreeField(props);

    const callResult = ref('');

    const apiCall = () => {
      let Fields = props.Field.Options.Fields || props.Field.Name;

      if (!props.Field.Options || !props.Field.Options.Fields) {
        return;
      }

      const paramObj = {};
      if (Fields.length > 0) {
        if (typeof Fields === 'string') {
          Fields = Fields.split(',');
        }
        for (let i = 0; i < Fields.length; i += 1) {
          const fld = Fields[i];

          if (fld) {
            Object.setValue(paramObj, fld, Object.nestValue(fieldData.value, fld));
          }
        }
      } else {
        Object.setValue(paramObj, props.Field.Name, fieldData.value);
      }

      vm[`${props.Field.Options.Method || 'post'}Request`](props.Field.Options.Url, paramObj).then((d) => {
        if (d && d.msg === 'OK') {
          if (d.data && d.data.value) {
            callResult.value = JSON.stringify(d.data.value);
          } else {
            callResult.value = JSON.stringify(d.data);
          }

          // other extra new fields
          (props.Field.Options.ExtraFieldNames || '').split(',').forEach((fname) => {
            Object.setValue(props.values, fname, d.data[fname]);
          });
        }
      });
    };

    watchEffect(() => {
      fieldData.value && apiCall();
    })

    const readonlyNode = () => h(ReadonlyContent, {
      Field: props.Field,
      Content: callResult.value,
    });

    return () => h('div', {
      class: 'simple-field input-field-apicall row items-center no-wrap',
    }, [
      readonlyNode(),
      slots.warning && slots.warning(),
    ]);
  },
});
