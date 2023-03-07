<template>
  <div class="input-field-select-chain row items-start no-wrap">
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
    <span style="margin-left: 12px;">
      <slot name="warning"></slot>
      <span
        v-if="Field && Field.Options && Field.Options.Fields && !Field.ReadOnly"
        class="row q-gutter-sm no-wrap"
      >
        <q-select
          class="simple-field"
          hide-bottom-space
          v-for="(option, index) in Field.Options.Fields"
          :key="index"
          v-model="valuesList[index]"
          :options="optionsList[index]"
          option-value="Value"
          option-label="Label"
          map-options
          :label="valuesList[index] ? '' : option.Placeholder"
          emit-value
          v-bind="$attrs"
          @input="selectionChanged(index)"
          :ref="`input_field_validator_${index}`"
        ></q-select>
      </span>
      <span v-if="Field && Field.ReadOnly">
        <span
          class="readonly-content"
          v-for="(option, index) in Field.Options.Fields"
          :key="index"
        >
          <span v-if="valuesList[index] && !option.Hide">
            {{optionsList[index] ?
                (optionsList[index].find(o => o.Value === valuesList[index]) || {}).Label : ''}}
          </span>
        </span>
      </span>
    </span>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldSelectChain',
  mixins: [mixins.InputFieldMixin],
  emits:['input'],
  fieldInfo: {
    Category: 'Advanced',
    Label: '选择链',
    Value: 'SelectionChain',
    Extra: [
      {
        Type: 'String',
        Label: '数据获取地址',
        Name: 'Options.Url',
      },
      {
        Type: 'String',
        Label: '上级数据名',
        Name: 'Options.ParentName',
      },
      {
        Type: 'DynamicList',
        Label: '列',
        Name: 'Options.Fields',
        Options: {
          Columns: [
            {
              Label: 'Name',
              Name: 'Name',
            },
            {
              Label: 'Placeholder',
              Name: 'Placeholder',
            },
            {
              Label: 'Default',
              Name: 'Default',
            },
            {
              Label: 'Hide',
              Name: 'Hide',
              Type: 'Boolean',
              Default: false,
            },
          ],
        },
      },
    ],
    Description: '',
  },
  data() {
    return {
      optionsList: [],
      valuesList: [],
    };
  },
  watch: {
    Field() {
      this.initOptions();
    },
    fieldData(v) {
      if(typeof v === 'undefined'){
        this.valuesList = [];
      }
      this.initOptions();
    },
  },
  created() {
    this.fieldData = this.fieldData || {};
    this.initOptions();
  },
  methods: {
    initOptions() {
      if (this.optionsList.length > 0) return;

      if (this.Field && this.Field.Options && this.Field.Options.Fields) {
        for (let i = 0; i < this.Field.Options.Fields.length; i += 1) {
          const fld = this.Field.Options.Fields[i];

          if (this.fieldData) this.fieldData[fld.Name] = this.fieldData[fld.Name] || fld.Default || '';

          this.valuesList[i] = this.fieldData[fld.Name];
          if (i === 0 || this.valuesList[i - 1]) {
            this.getOptions(i);
          }
        }
      }
    },
    getOptions(index) {
      if (!this.Field || !this.Field.Options || !this.Field.Options.Fields) {
        return;
      }

      if (index > 0 && !this.valuesList[index - 1]) return;

      if(this.Field.Options.Url){
        const obj = {};
        obj[this.Field.Options.ParentName] = this.Field.Options.Fields[index - 1]
          ? this.valuesList.slice(0, index).join('.')
          : '';

        this.getRequest(this.Field.Options.Url, obj).then((d) => {
          if (d && d.msg === 'OK' && Array.isArray(d.data)) {
            //this.$set(this.optionsList, index, d.data);
            this.optionsList[index] = d.data;
          }
        });
      } else if(this.Field.Options.Data){
        let parent = this.Field.Options.Fields[index - 1]
          ? this.valuesList.slice(0, index).join('.')
          : '';

        parent = parent && parent.split('.');
        parent = parent && parent.pop();
        parent = parent || '';

        //this.$set(this.optionsList, index, this.Field.Options.Data.filter(dd => dd[this.Field.Options.ParentName] === parent));
        this.optionsList[index] = this.Field.Options.Data.filter(dd => dd[this.Field.Options.ParentName] === parent);
      }
    },
    selectionChanged(index) {
      this.fieldData = this.fieldData || {};
      if (index < this.Field.Options.Fields.length - 1) {
        for (let i = index + 1; i < this.Field.Options.Fields.length; i += 1) {
          delete this.valuesList[i];
          delete this.optionsList[i];
          this.fieldData[this.Field.Options.Fields[i].Name] = '';
        }
        this.getOptions(index + 1);
      }

      this.fieldData[this.Field.Options.Fields[index].Name] = this.valuesList[
        index
      ];
      this.$emit('input');
    },
  },
});
</script>
