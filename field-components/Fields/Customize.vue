<template>
  <div class="input-field-customize">
    <span
      :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
          ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.Label"
    >
      <q-tooltip
        v-if="Field.Description"
        anchor="top right"
      >{{Field.Description}}</q-tooltip>
      {{Field.Label || ''}}
      <span
        v-if="Field.Required"
        class="required-mark"
      >*</span>
    </span>

    <span ref="content"></span>

    <slot name="warning"></slot>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldCustomize',
  mixins: [mixins.InputFieldMixin],
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
  watch: {
    htmlContent() {
      this.$refs.content.innerHTML = this.htmlContent;
    },
    // fieldData() {
    //   if (this.fieldData && this.$refs.content) {
    //     this.$refs.content.innerHTML = this.generateContent(this.fieldData);
    //   }
    // },
  },
  mounted() {
    if (this.htmlContent) {
      this.$refs.content.innerHTML = this.htmlContent;
    }
  },
  computed: {
    htmlContent() {
      const template = this.Field && this.Field.Options ? this.Field.Options.Template : '';
      if (!template) return '';

      if (!this.fieldData) return template;

      const replaced = template.replace(
        /<efield>{([^<]*)}<\/efield>/g,
        (match, name) => {
          if (this.fieldData[name]) {
            // could be options
            if (this.fieldData.StepsDefinition) {
              const cStep = this.fieldData.StepsDefinition.find(
                (s) => s.Index === this.fieldData.CurrentStep,
              );
              if (cStep && cStep.Fields) {
                const fld = cStep.Fields.find((f) => f.Name === name);

                if (fld && fld.Options && Array.isArray(fld.Options)) {
                  const fVal = fld.Options.find(
                    (o) => o.Value === this.fieldData[name],
                  );

                  if (fVal && fVal.Label) {
                    return fVal.Label;
                  }
                }
              }
            }

            // otherwise.
            return this.fieldData[name];
          }
          return '';
        },
      );

      return replaced;
    },
  },
});
</script>
