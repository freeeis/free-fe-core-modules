<template>
  <span class="free-field-labels">
    <span
      v-if="Field.ReadOnly"
      class="full-width"
    >
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="Field.Label !== void 0"
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
      <span class="readonly-content">
        <span
          class="prefix"
          v-if="Field.Options && Field.Options.Prefix"
        >
          {{Field.Options.Prefix}}</span>
        <span :style="(Field.Info && Field.Info.Style) ? Field.Info.Style : ''">
          {{reaonlyContent}}</span>
        <span
          class="postfix"
          v-if="Field.Options && Field.Options.Postfix"
        >{{Field.Options.Postfix}}</span>
      </span>
    </span>
    <q-input
      v-else
      :readonly="Field.ReadOnly"
      hide-bottom-space
      autogrow
      v-model="newLabel"
      @keydown.enter="addLabel"
      ref="input_field_validator_label"
    >
      <template v-slot:prepend>
        <q-chip
          v-for="(label, index) in fieldData.value"
          :key="index"
          removable
          :value="!!fieldData.value[index]"
          @remove="fieldData.value.splice(index,1) && $emit('input')"
          :color="Field.BgColor || 'primary'"
          :text-color="Field.Color || 'white'"
        >{{label}}</q-chip>
      </template>
      <template v-slot:before>
        <span
          :class="`field-label ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
          v-if="Field.Label !== void 0"
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
      </template>
      <template v-slot:append>
        <q-btn
          flat
          round
          dense
          icon="add"
          @click="addLabel"
        ></q-btn>
      </template>
    </q-input>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldLabels',
  props:  {
    ...freeFieldProps,
  },
  emits:['input'],
  fieldInfo: {
    Category: 'Simple',
    Label: '标签',
    Value: 'Labels',
    Description: '',
    Extra: [
      {
        Type: 'Boolean',
        Label: '允许批量输入',
        Name: 'Options.Batch',
        Description:
          '默认情况下，输入信息中的换行符会被忽略，但如果开户此选项，输入将以换行符分割为多个项，批量保存。',
      },
    ],
  },
  data() {
    return {
      newLabel: '',
    };
  },
  setup(props, { expose }) {
    const { fieldData, setFieldData } = useFreeField(props);

    const { validate } = useFormValidator('input_field_validator_label');
    expose({
      validate,
    });

    return {
      fieldData,
      setFieldData,
    }
  },
  // created() {
  //   // init labels
  //   if (this.Field.Type === 'Labels') {
  //     this.data[this.Field.Name] = this.data[this.Field.Name] || [];
  //   }
  // },
  computed: {
    reaonlyContent() {
      return (this.fieldData.value || []).filter((f) => !!f).join(',');
    },
  },
  methods: {
    addLabel() {
      if (!this.newLabel) return;

      let labelList = [];
      if (this.Field && this.Field.Options && this.Field.Options.Batch) {
        this.newLabel = this.newLabel.replace(/\r\n/g, /\n/);
        this.newLabel = this.newLabel.replace(/\r/g, /\n/);
        this.newLabel = this.newLabel.replace(/\n\n/g, /\n/);
        labelList = this.newLabel.split(/\n/);
      } else {
        labelList = [this.newLabel.replace(/(\r\n|\r|\n)/g, '')];
      }

      if (!labelList || labelList.length <= 0) return;

      let changed = false;
      const currentList = this.fieldData.value || [];

      for (let i = 0; i < labelList.length; i += 1) {
        const l = labelList[i];

        if (
          l
          && (currentList.indexOf(l) < 0)
        ) {
          currentList.push(l);
          changed = true;
        }
      }

      if (changed) {
        this.setFieldData(currentList);
        this.$emit('input');
      }

      this.newLabel = '';
      this.$refs.input_field_validator_label.focus();
    },
  },
});
</script>

<style lang="sass">
.free-field-labels
  .q-field__prepend
    height: auto
    flex-wrap: wrap
  .q-field__control,.q-field__inner,.q-field__before
    flex-wrap: wrap !important
  .free-field-warning
    display: block
    margin-left: $fieldLabelWidth
    left: 10px
</style>
