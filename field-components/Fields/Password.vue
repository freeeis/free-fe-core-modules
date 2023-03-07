<template>
  <span class="simple-field input-field-password row items-center no-wrap">
    <q-input
      v-model="fieldData"
      v-bind="$attrs"
      hide-bottom-space
      :readonly="Field.ReadOnly"
      :type="isPwd ? 'password' : 'text'"
      :autocomplete="(Field.Options && Field.Options.autocomplete) ? '' : 'new-password'"
      @input="$emit('input')"
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

      <template v-slot:append>
        <e-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldPassword',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Simple',
    Label: '密码',
    Value: 'Password',
    Description: '',
    Extra: [
      {
        Type: 'Boolean',
        Label: '自动填入',
        Name: 'Options.autocomplete',
        Default: 'false',
      },
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
      },
    ],
  },
  data() {
    return {
      isPwd: true,
    };
  },
  computed: {
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
