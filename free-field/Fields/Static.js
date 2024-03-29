import { defineComponent, h } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';

export default defineComponent({
  name: 'InputFieldStatic',
  fieldInfo: {
    Category: 'Static',
    Label: '固定内容',
    Value: 'Static',
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  setup(props, { slots }){
    if (!props.Field) return {};

    const { fieldData } = useFreeField(props);

    return () => h('div', {
      class: 'free-field-static',
    }, [
      slots.warning && slots.warning(),
      fieldData.value,
    ]);
  },
});
