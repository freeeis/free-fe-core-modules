import { defineComponent, h } from 'vue';

export default defineComponent({
  name: "FreeFieldDraggable",
  props: {
    dropEffect: String,
    dataName: String,
    data: {
      default: ""
    },
    extra: Object
  },
  setup(props, { slots }){
    const onDragstart =  (e) => {
      if(typeof props.data === 'object' && props.extra) {
        e.dataTransfer.setData(props.dataName || "data", JSON.stringify(Array.isArray(props.data) ? [...props.data, ...props.extra] : {...props.data, ...props.extra}));
      } else {
        e.dataTransfer.setData(props.dataName || "data", JSON.stringify(props.data));
      }

      e.dataTransfer.dropEffect = props.dropEffect;
    };

    return () => h('div', {
      class: 'free-field-draggable',
      draggable: true,
      onDragstart,
    }, slots.default ? slots.default() : undefined)
  }
})
