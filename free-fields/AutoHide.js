import {
  defineComponent,
  h,
  ref,
  computed,
  nextTick,
} from "vue";
import { QIcon } from 'quasar';

export default defineComponent({
  name: "FreeFieldAutoHide",
  props: {
    hideIcon: String,
    vertical: Boolean,
    size: String,
    duration: Number
  },
  setup(props, { slots }) {
    const hovered = ref(false);
    const defaultIcon = props.vertical ? 'more_vert' : 'more_horiz';
    const freez = ref(false);

    const renderH = computed(() => {
      if(hovered.value) {
        return h('div', {
          onMouseleave: () => {
            if(freez.value) return;

            nextTick(() => {
              hovered.value = false;
              freez.value = true;
            })
          },
          onMousemove: () => {
            nextTick(() => {
              freez.value = false;
            })
          }
        }, slots.default ? slots.default() : undefined);
      }

      return h(
          QIcon,
          {
            name: props.hideIcon || defaultIcon,
            size: props.size || 'md',
            onMouseenter: () => {
              if(freez.value) return;

              nextTick(() => {
                freez.value = true;
              })
            },
            onMousemove: () => {
              nextTick(() => {
                hovered.value = true;
                freez.value = false;
              })
            }
          }
        );
    })

    return () => renderH.value;
  },
});
