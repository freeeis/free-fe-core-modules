import { defineComponent, h } from 'vue';
import FieldLabel from './freeFieldLabel';

export default defineComponent({
  name: 'ReadOnlyContent',
  props: {
    Field: { type: Object },
    Content: {},
  },
  setup(props){
    if (!props.Field) return {};

    const readonlyNode = () => h('span', {
      class: 'full-width',
    }, [
      (props.Field.Label !== void 0) && h(FieldLabel, {
        Field: props.Field,
      }),
      h('span', {
        class: 'readonly-content'
      }, [
        props.Field.Options?.Prefix && h('span', {
          class: 'prefix'
        }, props.Field.Options.Prefix),
        h('span', {
          style: props.Field.Info?.Style,
        }, props.Content),
        props.Field.Options?.Postfix && h('span', {
          class: 'postfix',
        }, props.Field.Options.Postfix)
      ]),
    ]);

    return readonlyNode;
  },
});
