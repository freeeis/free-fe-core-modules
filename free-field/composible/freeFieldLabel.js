import { defineComponent, h } from 'vue';
import { QTooltip } from 'quasar';

export default defineComponent({
  name: 'FreeFieldLabel',
  props: {
    Field: { type: Object },
  },
  setup(props){
    return () => (props.Field?.Label === void 0) ? null : h('span', {
      class:`field-label field-label-readonly ${(props.Field.Label && props.Field.Label.trim().length)
          ? '' : 'field-label-empty'} ${props.Field.Required ? 'required' : ''}`,
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
