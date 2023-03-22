import { defineComponent, h } from 'vue';
import { QTooltip } from 'quasar';

export default defineComponent({
  name: 'FreeFieldLabel',
  props: {
    Field: { type: Object },
  },
  setup(props){
    if (!props.Field) return () => null;

    return () => (props.Field?.Label === void 0) ? null : h('span', {
      class: {
        'field-label': true,
        'field-label-readonly': props.Field.ReadOnly,
        'field-label-empty': props.Field.Label?.trim().length <= 0,
        required: props.Field.Required,
      },
    }, [
      props.Field.Description && h(QTooltip, {
        anchor: "top right",
      }, () => props.Field.Description),
      props.Field.Label || '',
      props.Field.Required && h('span', {
        class: 'required-mark',
      }, '*'),
    ]);
  },
});
