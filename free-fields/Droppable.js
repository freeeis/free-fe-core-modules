import { defineComponent, h, ref } from 'vue';

export default defineComponent({
  name: "FreeFieldDroppable",
  props: {
    exact: Boolean,
    dataName: [String, Array],
    notToDraggable: Boolean,
    enterClass: String,
    enterStyle: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['freeTrigger', 'drop'],
  setup(props, { emit, slots }){
    const selfRef = ref(null);
    const originalStyle = {};

    const getTransferData = (e) => {
      let dropData;
      if(typeof props.dataName === 'string') {
        dropData = e.dataTransfer.getData(props.dataName);
      } else if(Array.isArray(props.dataName)) {
        dropData = {};
        for(let dn of props.dataName) {
          const dd = e.dataTransfer.getData(dn);

          if(dd) {
            dropData = `{"${dn}": ${dd}}`

            break;
          }
        }
      } else {
        dropData = e.dataTransfer.getData('data')
      }

      return dropData || "";
    }

    const onDragenter =  (e) => {
      if(props.exact && e.target !== selfRef.value) {
        return;
      }

      Object.keys(props.enterStyle).forEach(sk => {
        originalStyle[sk] = e.target.style[sk];
      });

      if (props.notToDraggable && e.target.draggable === true) {
        return;
      }

      e.target.classList.add(props.enterClass);
      Object.keys(originalStyle).forEach(sk => {
        e.target.style[sk] = props.enterStyle[sk];
      });
    }

    const onDragleave =  (e) => {
      if(props.exact && e.target !== selfRef.value) {
        return;
      }

      e.target.classList.remove(props.enterClass);
      Object.keys(originalStyle).forEach(sk => {
        e.target.style[sk] = originalStyle[sk];
      });
    }

    const onDragover =  (e) => {
      e.preventDefault()
    }

    const onDrop =  (e) => {
      if(props.exact && e.target !== selfRef.value) {
        return;
      }

      e.preventDefault()

      // don't drop on other draggables
      if (props.notToDraggable && e.target.draggable === true) {
        return;
      }

      let dropData = getTransferData(e);

      try{
        dropData = dropData &&  JSON.parse(dropData);
      } catch(_) {
        dropData = "";
      }

      if(dropData) {
        emit('drop', dropData);
      }

      e.target.classList.remove(props.enterClass);
      Object.keys(originalStyle).forEach(sk => {
        e.target.style[sk] = originalStyle[sk];
      });
    }

    return () => h('div', {
      ref: selfRef,
      onDragenter,
      onDragleave,
      onDragover,
      onDrop,
    }, slots.default ? slots.default() : undefined)
  }
})
