
import {
  defineComponent,
  h,
} from "vue";
import { QToggle } from 'quasar';

export default defineComponent({
  name: "FreeFieldBooleanEditor",
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(QToggle,{
      modelValue: props.modelValue,
      'onUpdate:modelValue': (e) => {
        emit('update:modelValue', Boolean(e) || false);
      }
    });
  },
});
