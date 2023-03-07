<template>
  <span
    class="simple-field input-field-number row items-center no-wrap"
    v-if="Field"
  >
    <span
      v-if="Field.ReadOnly"
      class="full-width"
    >
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="typeof Field.Label !== 'undefined'"
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
        >{{Field.Options.Prefix}}</span>
        <span :style="(Field.Info && Field.Info.Style) ? Field.Info.Style : ''">{{fieldData}}</span>
        <span
          class="postfix"
          v-if="Field.Options && Field.Options.Postfix"
        >{{Field.Options.Postfix}}</span>
      </span>
    </span>
    <q-input
      v-else
      :readonly="Field.ReadOnly"
      v-bind="$attrs"
      hide-bottom-space
      @input="valueChanged"
      type="number"
      v-model.number="localData"
      :ref="`input_field_validator_${Field.Name || Field.Label}`"
      :maxlength="maxlength"
    >
      <template v-slot:before>
        <span
          :class="`field-label ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
          v-if="typeof Field.Label !== 'undefined'"
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

      <template
        v-slot:prepend
        v-if="Field.Options && Field.Options.Prefix"
      >
        <span class="prefix">{{Field.Options.Prefix}}</span>
      </template>

      <template
        v-slot:append
        v-if="Field.Options && Field.Options.Postfix"
      >
        <span class="postfix">{{Field.Options.Postfix}}</span>
      </template>
    </q-input>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldNumber',
  mixins: [mixins.InputFieldMixin],
  emits:['input'],
  fieldInfo: {
    Category: 'Simple',
    Label: '数字',
    Value: 'Number',
    Extra: [
      {
        Type: 'String',
        Label: '前缀',
        Name: 'Options.Prefix',
      },
      {
        Type: 'String',
        Label: '后缀',
        Name: 'Options.Postfix',
      },
      {
        Type: 'Number',
        Label: '最小值',
        Name: 'MinValue',
      },
      {
        Type: 'Number',
        Label: '最大值',
        Name: 'MaxValue',
      },
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
      },
      {
        Type: 'DynamicList',
        Label: '附加字段',
        Name: 'Options.Extra',
        Options: {
          Columns: [
            {
              Label: '值范围',
              Name: 'Value',
              Type: 'Labels',
              Options: {
                Batch: true,
              },
            },
            {
              Label: '不在其中时',
              Type: 'Boolean',
              Name: 'WhenNotIn',
              Default: false,
            },
            {
              Label: '字段',
              Name: 'List',
              Type: 'FieldList',
              Options: {
                Columns: [
                  {
                    Label: '#',
                    Name: 'Index',
                    sortable: true,
                  },
                  {
                    Label: '名称',
                    Name: 'Name',
                    style: 'max-width: 200px;',
                    sortable: true,
                  },
                  {
                    Label: '标题',
                    Name: 'Label',
                    style: 'max-width: 200px;',
                    sortable: true,
                  },
                ],
              },
            },
          ],
        },
      },
    ],
    Description: '',
  },
  data() {
    return {
      localData: 0,
    };
  },
  watch: {
    fieldData() {
      this.localData = this.fieldData;
    },
  },
  created() {
    this.localData = this.fieldData;
  },
  computed: {
    maxlength() {
      if (this.Field && this.Field.Options && this.Field.Options.MaxLength) {
        return this.Field.Options.MaxLength;
      }

      return '';
    },
  },
  methods: {
    valueChanged(d) {
      if (!d) return;

      if (!Number(d) && Number(d) !== 0) return;

      let v = d;
      if (typeof this.Field.MinValue !== 'undefined' && Number(this.Field.MinValue) > v) {
        v = Number(this.Field.MinValue);
      }
      if (typeof this.Field.MaxValue !== 'undefined' && Number(this.Field.MaxValue) < v) {
        v = Number(this.Field.MaxValue);
      }

      this.localData = v;
      this.fieldData = v;

      this.$emit('input');
    },
    initExtra() {
      if (
        this.Field
        && this.Field.Options
        && this.Field.Options.Extra
        && this.Field.Options.Extra.length > 0
        && this.fieldData
      ) {
        const extraList = [];
        const dataValue = this.fieldData ? this.fieldData.toString() : '';
        for (let i = 0; i < this.Field.Options.Extra.length; i += 1) {
          const extra = this.Field.Options.Extra[i];

          if (extra.Value && extra.Value.length > 0) {
            const hasIndex = extra.Value.indexOf(dataValue);
            if ((extra.WhenNotIn && hasIndex < 0)
              || (!extra.WhenNotIn && hasIndex >= 0)) {
              for (let j = 0; j < extra.List.length; j += 1) {
                const fld = extra.List[j];
                // if (extraList.findIndex(f => f.Name === fld.Name && f.Label === fld.Label) < 0) {
                extraList.push(fld);
                // }
              }
            }
          }
        }
        return extraList;
      }
      return [];
    },
  },
});
</script>
