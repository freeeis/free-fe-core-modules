import { defineComponent, h, computed } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import freeFieldLabel from '../composible/freeFieldLabel';

export default defineComponent({
  name: 'InputFieldCustomize',
  fieldInfo: {
    Category: 'Advanced',
    Label: '自定义模板',
    Value: 'Customize',
    Extra: [
      {
        Type: 'Rich',
        Label: '模板',
        enableField: true,
        Name: 'Options.Template',
      },
    ],
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  setup(props, { slots }){
    if (!props.Field) return {};

    const { fieldData } = useFreeField(props);

    const htmlContent = computed(() => {
      const template = props.Field && props.Field.Options ? props.Field.Options.Template : '';
      if (!template) return '';

      if (!fieldData.value) return template;

      const replaced = template.replace(
        /<efield>{([^<]*)}<\/efield>/g,
        (match, name) => {
          if (fieldData.value[name]) {
            // could be options
            if (fieldData.value.StepsDefinition) {
              const cStep = fieldData.value.StepsDefinition.find(
                (s) => s.Index === fieldData.value.CurrentStep,
              );
              if (cStep && cStep.Fields) {
                const fld = cStep.Fields.find((f) => f.Name === name);

                if (fld && fld.Options && Array.isArray(fld.Options)) {
                  const fVal = fld.Options.find(
                    (o) => o.Value === fieldData.value[name],
                  );

                  if (fVal && fVal.Label) {
                    return fVal.Label;
                  }
                }
              }
            }

            // otherwise.
            return fieldData.value[name];
          }
          return '';
        },
      );

      return replaced;
    });

    const before = (props.Field.Label !== void 0) ? () => h(freeFieldLabel, {
      Field: props.Field,
    }) : () => h('div', {
      class: 'field-label-empty'
    });

    const contentNode = () => h('span', {
      innerHTML: htmlContent.value,
    }, );

    return () => h('div', {
      class: 'free-field-customize',
    }, [
      before(),
      contentNode(),
      slots.warning && slots.warning(),
    ]);
  },
});
