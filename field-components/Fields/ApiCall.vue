<template>
  <div class="simple-field input-field-apicall row items-start no-wrap">
    <span
      class="full-width"
      v-if="Field"
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
        <span class="prefix" v-if="Field.Options && Field.Options.Prefix">
          {{Field.Options.Prefix}}
        </span>
        <span :style="(Field.Info && Field.Info.Style) ? Field.Info.Style : ''">
          {{callResult}}
        </span>
        <span
          class="postfix"
          v-if="Field.Options && Field.Options.Postfix"
        >{{Field.Options.Postfix}}</span>
      </span>
    </span>
    <slot name="warning"></slot>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldApiCall',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Advanced',
    Label: '特定接口处理',
    Value: 'ApiCall',
    Extra: [
      {
        Type: 'String',
        Label: '数据获取地址',
        Name: 'Options.Url',
      },
      {
        Type: 'String',
        Label: '传送字段名',
        Name: 'Options.Fields',
        Placeholder: '逗号分割',
        Tips: [
          {
            Text: '默认将传送当前字段数据，但可以指定相同数据层级下的其他字段。',
          },
        ],
      },
      {
        Type: 'String',
        Label: '附加字段名',
        Name: 'Options.ExtraFieldNames',
        Placeholder: '逗号分割',
        Tips: [
          {
            Text: '如果接口返回值中有这些字段，他们将会被赋予当前父数据中。',
          },
        ],
      },
    ],
    Description: '',
  },
  data() {
    return {
      callResult: '',
    };
  },
  watch: {
    fieldData() {
      this.apiCall();
    },
  },
  // created() {
  //   this.apiCall();
  // },
  // updated() {
  //   this.apiCall();
  // },
  methods: {
    apiCall() {
      this.Field.Options.Fields = this.Field.Options.Fields || this.Field.Name;

      if (!this.Field || !this.Field.Options || !this.Field.Options.Fields) {
        return;
      }

      const paramObj = {};
      if (this.Field.Options.Fields.length > 0) {
        if (typeof this.Field.Options.Fields === 'string') {
          this.Field.Options.Fields = this.Field.Options.Fields.split(',');
        }
        for (let i = 0; i < this.Field.Options.Fields.length; i += 1) {
          const fld = this.Field.Options.Fields[i];

          if (fld) {
            Object.setValue(paramObj, fld, Object.nestValue(this.data, fld));
          }
        }
      } else {
        Object.setValue(paramObj, this.Field.Name, this.fieldData);
      }

      this.postRequest(this.Field.Options.Url, paramObj).then((d) => {
        if (d && d.msg === 'OK') {
          if (d.data && d.data.value) {
            this.callResult = d.data.value;
          } else {
            this.callResult = d.data;
          }

          // other extra new fields
          (this.Field.Options.ExtraFieldNames || '').split(',').forEach((fname) => {
            //this.$set(this.data, fname, d.data[fname]);
            this.data[fname] = d.data[fname];
          });
        }
      });
    },
  },
});
</script>
