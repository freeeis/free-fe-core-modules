import {
  defineComponent,
  h,
  ref,
  computed,
  nextTick,
} from "vue";

export default defineComponent({
  name: "FreeFieldEditableString",
  props: {
    modelValue: [String, Number],
    debounce: Number
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const editable = ref(false);
    const inputRef = ref(null);

    const inputEvent = (e) => {
      const vv = typeof props.modelValue === 'number' ? (Number(e.target.value) || 0) : e.target.value;
      emit("update:modelValue", vv);
      editable.value = false;
    };

    const renderH = computed(() => {
      if(editable.value) {
        return h("input", {
          style: "outline: none; border: none;padding: 0;margin:0;width: 100%;",
          ref: inputRef,
          value: props.modelValue || '',
          onKeydown: (e) => e.code === 'Enter' && inputRef.value.blur(),
          onBlur: inputEvent,
          onClick: (e) => {
            e.cancelBubble = true;
            e.preventDefault();
          },
        });
      }

      return h(
          "div",
          {
            class: "",
            style: "min-width: 4px; min-height: 12px;",
            onClick: (e) => {
              e.cancelBubble = true;
              e.preventDefault();
              editable.value = true;
              nextTick(() => {
                inputRef.value.focus();
              });
            },
          },
          [
            props.modelValue
          ]
        );
    })

    return () => renderH.value;
  },
});
