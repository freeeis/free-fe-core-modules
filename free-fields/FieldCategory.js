import {
  defineComponent,
  h,
  ref,
  computed,
  nextTick,
} from "vue";
import { QSpace, QSeparator } from 'quasar';

export default defineComponent({
  name: "FreeFieldCategory",
  props: {
    hide: Boolean,
    hidden: Boolean,
    line: Boolean,
    title: String,
    titleClass: String,
    titleStyle: String,
    showLabel: {
      type: String,
      default: 'Show'
    },
    hideLabel: {
      type: String,
      default: 'Hide'
    },
    titleClickable: Boolean,
    showLabelWhenHidden: Boolean
  },
  setup(props, { slots }) {
    const hidden = ref(props.hidden || false);
    const hovered = ref(false);
    const titleClickable = props.titleClickable && props.hide;

    return () => h('div',{
      class: 'free-field-category',
      style: 'font-size: 16px;'
    },[
      h('div', {
        class: `free-field-category-title row no-wrap text-grey-9 ${titleClickable ? 'cursor-pointer' : ''}`,
        onMouseenter: () => {
          nextTick(() => {
            hovered.value = true
          })
        },
        onMouseleave: () => {
          nextTick(() => {
            hovered.value = false
          })
        },
        onClick: () => {
          if(!titleClickable) return;

          nextTick(() => {
            hidden.value = !hidden.value;
          })
        }
      },
      [
        h('div', {
          class: props.titleClass || 'q-mb-sm',
          style: props.titleStyle,
        } ,props.title || ''),
        h(QSpace),
        props.hide ? ((hovered.value || (props.showLabelWhenHidden && hidden.value)) ? h('div', {
          class: `free-field-category-hide-btn cursor-pointer ${props.titleClass}`,
          style: props.titleStyle,
          onClick: () => {
            if(props.titleClickable) return;

            nextTick(() => {
              hidden.value = !hidden.value;
            })
          }
        } ,(hidden.value ? props.showLabel : props.hideLabel) || '') : undefined) : undefined,
      ]),
      slots.default ? (hidden.value ? undefined : slots.default()) : undefined,
      props.line ? h(QSeparator, {
        class: 'free-field-category-line q-my-sm'
      }) : undefined,
    ]);
  },
});
