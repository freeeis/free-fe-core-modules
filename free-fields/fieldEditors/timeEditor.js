
import {
  defineComponent,
  h,
} from "vue";
import { QInput } from 'quasar';

export default defineComponent({
  name: "FreeFieldTimeEditor",
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(QInput,{
      type: 'time',
      modelValue: props.modelValue,
      'onUpdate:modelValue': (e) => {
        emit('update:modelValue', e);
      }
    });
  },
});
