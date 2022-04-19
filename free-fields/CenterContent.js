import {
  defineComponent,
  h,
} from "vue";

export default defineComponent({
  name: "FreeFieldCenterContent",
  setup(props, { slots }) {
    return () => h('div', {
      class: "relative-position full-height full-width"
    }, h('div', {
      class: "absolute-center"
    }, slots.default ? slots.default() : undefined))
  },
});
