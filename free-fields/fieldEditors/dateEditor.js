
import {
  defineComponent,
  h,
} from "vue";
import { QInput } from 'quasar';

export default defineComponent({
  name: "FreeFieldDateEditor",
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(QInput,{
      type: 'date',
      modelValue: props.modelValue,
      'onUpdate:modelValue': (e) => {
        emit('update:modelValue', e);
      }
    });
  },
});
