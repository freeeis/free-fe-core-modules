
import {
  defineComponent,
  h,
  resolveDynamicComponent
} from "vue";

export default defineComponent({
  name: "FreeFieldLabeledField",
  props: {
    dense: {type: Boolean, default: true},
    label: String,
    labelMinWidth: {
      type: String,
      default: "100px"
    },
    required: Boolean,
    requiredMark: String,
    hideRequiredMark: Boolean,
    readonly: Boolean,
    modelValue: {},
    type: String,
    submitOnClose: {
      type: Boolean,
      default: true,
    },
    valueClickStop: {
      type: Boolean,
      default: true,
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const dType = props.type || {
      string: "String",
      boolean: "Boolean",
      number: "Number",
      object: "Object",
      array: "Array"
    }[typeof props.modelValue] || 'String';

    const theComp = resolveDynamicComponent(`${dType}Editor`);

    return () => theComp ? h('div', {
      class: "free-labeled-field row no-wrap items-center full-width",
    }, [
      h('div', {
        class: "free-labeled-field-label q-pr-md text-right",
        style: `min-width: ${props.labelMinWidth}`
      }, [
        props.label,
        (!props.hideRequiredMark && props.required)? h('span', {
          class: "text-red"
        }, props.requiredMark || '*') : undefined,
      ]),
      h(theComp,{
        filled: true,
        "bottom-slots": false,
        // rules: props.required ? ([(val) => !!val]) : "",
        dense: props.dense,
        class: "col",
        readonly: props.readonly,
        valueClickStop: props.valueClickStop,
        submitOnClose: props.submitOnClose,
        modelValue: props.modelValue,
        'onUpdate:modelValue': (e) => {
          if(props.required && (!e && e !== 0 && e !== false)) return;

          emit('update:modelValue', e);
        }
      })
    ]) : undefined;
  },
});
