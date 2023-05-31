<template>
  <div class="free-field-single-list row" v-if="Field">
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
import { defineComponent, ref, computed } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';

export default defineComponent({
  name: 'InputFieldSingleList',
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
  props: {
    ...freeFieldProps,
  },
  setup(props) {
    if (!props.Field) return () => null;

    const { fieldData } = useFreeField(props);

    const localData = computed(() => {
      let list = [];
      if (fieldData.value !== void 0 && fieldData.value !== '') {
        if (Array.isArray(fieldData.value)) {
          list = fieldData.value;
        } else if (typeof fieldData.value === 'string') {
          const newStr = fieldData.value.replace(/，/g, ',');
          list = newStr.split(',');
        } else {
          list = [fieldData.value];
        }
      }

      if (props.Field.Options) {
        if (props.Field.Options.NoSpace) {
          for (let i = 0; i < list.length; i += 1) {
            const l = list[i];

            if (typeof l === 'string') {
              list[i] = l.trim();
            }
          }
        }

        if (props.Field.Options.NoEmpty) {
          list = list.filter((l) => !!l);
        }

        if (props.Field.Options.NoDup) {
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
    });


    return {
      localData,
    };
  },
});
</script>
