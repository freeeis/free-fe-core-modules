<template>
  <div class="free-field-column column" :class="columnClasses" v-if="Field">
    <free-field
      v-for="(field, idx) in Field.Options?.List"
      :Field="field"
      :values="fieldData"
      :key="idx"
      @input="$emit('input')"></free-field>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { freeFieldProps } from '../composible/useFreeField';

export default defineComponent({
  name: 'InputFieldColumn',
  props: {
    ...freeFieldProps,
  },
  fieldInfo: {
    Category: 'Container',
    Label: '列',
    Value: 'Column',
    Extra: [
      {
        Label: '不换行',
        Name: 'Options.NoWrap',
        Type: 'Bollean',
      },
      {
        Label: '横向对齐',
        Name: 'Options.ItemsAlign',
        Type: 'Select',
        Options: [
          {
            Label: '居上',
            Value: 'items-start',
          },
          {
            Label: '居中',
            Value: 'items-center',
          },
          {
            Label: '居下',
            Value: 'items-end',
          },
        ],
      },
      {
        Label: '竖向对齐',
        Name: 'Options.JustifyAlign',
        Type: 'Select',
        Options: [
          {
            Label: '居左',
            Value: 'justify-start',
          },
          {
            Label: '居中',
            Value: 'justify-center',
          },
          {
            Label: '居右',
            Value: 'justify-end',
          },
          {
            Label: '围绕',
            Value: 'justify-around',
          },
          {
            Label: '之间',
            Value: 'justify-between',
          },
          {
            Label: '均匀',
            Value: 'justify-evently',
          },
        ],
      },
      {
        Label: '字段',
        Name: 'Options.List',
        Type: 'FieldList',
        Options: {
          Columns: [
            {
              Label: '#',
              Name: 'Index',
              sortable: true,
            },
            {
              Label: '类型',
              Name: 'Type',
              style: 'max-width: 120px;',
              sortable: true,
            },
            {
              Label: '名称',
              Name: 'Name',
              style: 'max-width: 200px;',
            },
            {
              Label: '默认',
              Name: 'Default',
              style: 'max-width: 200px;',
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
    Description: '',
  },
  computed: {
    columnClasses() {
      return this.Field.Options?.NoWrap ? 'nowrap' : '' + this.Field.Options?.ItemsAlign + ' ' + this.Field.Options?.JustifyAlign;
    },
  },
});
</script>

<style lang="scss" scoped>
</style>
