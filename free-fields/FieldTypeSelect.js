import {
  defineComponent,
  h,
} from "vue";
import { QIcon, QItem, QItemSection,QSelect } from 'quasar';

const dataTypeIcons = {
  String:"text_snippet",
  Number:"looks_one",
  Boolean:"toggle_on",
  Date:"event",
  Time:"schedule",
  Array:"data_array",
  Object:"data_object"
}

export default defineComponent({
  name: "FreeFieldTypeSelect",
  props: {
    types: Array,
    modelValue: String,
    showLabel: Boolean,
    dense: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const options = props.types || [
      {
        value: "String",
        label: "String",
        icon: 'text_snippet'
      },
      {
        value: "Number",
        label: "Number",
        icon: 'looks_one'
      },
      {
        value: "Boolean",
        label: "Boolean",
        icon: 'toggle_on'
      },
      {
        value: "Array",
        label: "Array",
        icon: 'data_array'
      },
      {
        value: "Object",
        label: "Object",
        icon: 'data_object'
      },
    ];

    return () => h(QSelect, {
      dense: props.dense,
      'options-dense': props.dense,
      borderless: true,
      rounded: true,
      standout: true,
      'hide-dropdown-icon': true,
      'hide-bottom-space': true,
      modelValue: props.modelValue,
      class: '',
      'popup-content-style': props.dense ? 'min-width: 60px; width: 60px; overflow: hidden;' : '',
      options,
      "onUpdate:modelValue": (e) => emit("update:modelValue", e.value),
    },{
      option: (op) => h(QItem, {
        ...op.itemProps,
      }, () => [
        h(QItemSection, {
          class: 'q-ma-none q-pa-none',
          avatar: true
        }, () => h(QIcon, {
          name: op.opt.icon
        })),
        props.showLabel ? h(QItemSection, {
          class: 'q-ma-none q-pa-none',
          avatar: true
        }, () => props.showLabel ? op.opt.label : '') : undefined]),
      'selected-item': (op) => h(QIcon, {
        class: 'bg-grey-3 q-pa-xs self-center',
        style: 'border-radius: 50%; margin: 0 auto;',
        size: props.dense ? 'xs' : 'sm',
        dense: props.dense,
        name: dataTypeIcons[op.opt],
      }),
    });
  },
});
