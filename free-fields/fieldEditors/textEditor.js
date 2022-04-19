import {
  defineComponent,
  h,
  watchEffect
} from "vue";
import { QInput } from 'quasar';

export default defineComponent({
  name: "FreeFieldTextEditor",
  props: {
    modelValue: String,
    submitOnClose: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    let localValue;

    watchEffect(() => {
      localValue = props.modelValue;
    })

    return () => h(QInput,{
      ...attrs,
      type: 'textarea',
      modelValue: props.modelValue,
      'onUpdate:modelValue': (e) => {
        localValue = e || "";
        if(!props.submitOnClose) {
          emit('update:modelValue', localValue);
        }
      },
      onKeydown: (e) => {
        if(!props.submitOnClose) {
          return;
        }

        if(e.keyCode === 13) {
          emit('update:modelValue', localValue);
        }
      },
      onBlur: (e) => {
        if(!props.submitOnClose) {
          return;
        }

        emit('update:modelValue', localValue);
      }
    });
  },
});
