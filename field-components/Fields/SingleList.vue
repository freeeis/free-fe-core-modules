<template>
  <div class="input-field-single-list row" v-if="Field">
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

    <table flat>
        <thead v-if="Field && Field.Options && Field.Options.Header">
            <tr>
                <td>{{Field.Options.Header}}</td>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, index) in localData" :key="index">
                <td>
                    {{row}}
                </td>
            </tr>
        </tbody>
    </table>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldSingleList',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Table',
    Label: '单列表',
    Value: 'SingleList',
    Extra: [
      {
        Type: 'String',
        Label: '列头',
        Name: 'Options.Header',
      },
      {
        Type: 'Check',
        Label: '没有空格',
        Name: 'Options.NoSpace',
        Default: false,
      },
      {
        Type: 'Check',
        Label: '去空',
        Name: 'Options.NoEmpty',
        Default: false,
      },
      {
        Type: 'Check',
        Label: '去重',
        Name: 'Options.NoDup',
        Default: false,
      },
    ],
    Description: '',
  },
  data() {
    return {
      tableData: [],
    };
  },
  computed: {
    localData() {
      let list = [];
      if (typeof this.fieldData !== 'undefined' && this.fieldData !== '') {
        if (Array.isArray(this.fieldData)) {
          list = this.fieldData;
        } else if (typeof this.fieldData === 'string') {
          const newStr = this.fieldData.replace(/，/g, ',');
          list = newStr.split(',');
        } else {
          list = [this.fieldData];
        }
      }

      if (this.Field.Options) {
        if (this.Field.Options.NoSpace) {
          for (let i = 0; i < list.length; i += 1) {
            const l = list[i];

            if (typeof l === 'string') {
              list[i] = l.trim();
            }
          }
        }

        if (this.Field.Options.NoEmpty) {
          list = list.filter((l) => !!l);
        }

        if (this.Field.Options.NoDup) {
          const newList = [];
          for (let i = 0; i < list.length; i += 1) {
            const l = list[i];

            if (newList.indexOf(l) < 0) {
              newList.push(l);
            }
          }
          list = newList;
        }
      }

      return list;
    },
  },
});
</script>
