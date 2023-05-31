import { defineComponent, h } from 'vue';
import { QSeparator } from 'quasar';

export default defineComponent({
  name: 'InputFieldSeparator',
  fieldInfo: {
    Category: 'Static',
    Label: '分割线',
    Value: 'Separator',
    Description: '',
  },
  props: {
    inset: { type: Boolean, default: true },
  },
  setup(props){
    return () => h(QSeparator, {
      class: 'free-field-separator',
      inset: props.inset,
    });
  },
});
