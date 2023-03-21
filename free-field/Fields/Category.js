import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'InputFieldCategory',
  fieldInfo: {
    Category: 'Static',
    Label: '字段分类',
    Value: 'Category',
    Description: '',
  },
  props: {
    Field: { type: Object },
  },
  methods: {
  },
  setup(props, { slots }){
    if (!props.Field || (typeof props.Field.Label === 'undefined')) return;

    return () => h('div', {
      class: 'simple-field input-field-category row items-center no-wrap',
    }, [
      h('span', {
        class: 'label'
      }, props.Field.Label),
      slots.warning && slots.warning(),
    ]);
  },
});
