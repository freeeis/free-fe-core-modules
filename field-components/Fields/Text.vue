<template>
  <span class="input-field-text">
    <div :class="Field.Label ? 'warning-with-label' : 'warning-without-label'" >
      <slot name="warning"></slot>
    </div>
    <span v-if="Field.ReadOnly" class="row no-wrap">
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="typeof Field.Label !== 'undefined'"
      >
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content" style="white-space: pre-wrap">{{fieldData}}</span>
    </span>
    <q-input
      v-else
      type="textarea"
      v-model="fieldData"
      @input="$emit('input')"
      v-bind="$attrs"
      hide-bottom-space
      :readonly="Field.ReadOnly"
      :rows="rows"
      :ref="`input_field_validator_${Field.Name || Field.Label}`"
      :maxlength="maxlength"
    >
      <template v-slot:before>
        <span
          :class="`field-label ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
          v-if="typeof Field.Label !== 'undefined'">
          <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
          {{Field.Label || ''}}
          <span v-if="Field.Required" class="required-mark">*</span>
        </span>
      </template>
    </q-input>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldText',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Simple',
    Label: '文本',
    Value: 'Text',
    Extra: [
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
      },
    ],
    Description: '',
  },
  computed: {
    rows() {
      const contentLines = (this.fieldData && typeof this.fieldData === 'string') ? Math.max((this.fieldData.match(/\n/g) || '').length + 1, this.fieldData.length / 20) : 8;
      return (this.Field && this.Field.ReadOnly) ? Math.min(contentLines, 20) : 8;
    },
    maxlength() {
      if (this.Field && this.Field.Options
        && this.Field.Options.MaxLength) {
        return this.Field.Options.MaxLength;
      }

      return '';
    },
  },
});
</script>

<style lang="sass" scoped>
@import '../style.sass'

.q-field__native
  min-height: 160px

.warning-with-label
  margin-left: $fieldLabelWidth
</style>
