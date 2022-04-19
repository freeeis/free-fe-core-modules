<template>
  <div class="input-field-fixed-list row">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="typeof Field.Label !== 'undefined'"
    >
      <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
      {{Field.Label || ''}}
      <span v-if="Field.Required" class="required-mark">*</span>
    </span>
    <q-table
      class="q-ma-xs col"
      :rows="tableData"
      :columns="columns"
      row-key="Name"
      :hide-bottom="!summaryContent"
      separator="cell"
      :pagination="{rowsPerPage:100000}"
      table-header-class="row-zebra-even"
    >
      <template v-slot:top v-if="Field.Warning">
        <slot name="warning"></slot>
      </template>
      <template v-slot:body-cell="props">
        <q-td
          :props="props"
          style="text-align: center;"
          v-if="props.col.List &&
          (props.col.List.length === 1) &&
            props.row[props.col.List[0].Name] === 'NaN'"
          :class="tableTdClass(props.rowIndex)"
        >/</q-td>
        <q-td
          :props="props"
          v-else-if="showCell(props)"
          :colspan="props.value && props.value.colspan || 1"
          :rowspan="props.value && props.value.rowspan || 1"
          :class="`items-center justify-center ${tableTdClass(props.rowIndex)}`"
        >
          <span v-if="props.col.List && props.col.List.length > 1" class="full-width full-height">
            <free-field
              v-for="(col,index) in props.col.List"
              :key="index"
              :Field="columnField(col, true, props.col)"
              :values="props.row"
              @input="cellChanged()"
              :ref="`input_field_validator_${
                columnField(col, true, props.col).Name}-${index}-${props.row.auto__index}`"
            ></free-field>
          </span>
          <span v-else class="full-width full-height">
            <free-field
              :Field="columnField(props.col, false)"
              :values="props.row"
              @input="cellChanged()"
              borderless
              :ref="`input_field_validator_${
                columnField(props.col, false).Name}-${props.row.auto__index}`"
            ></free-field>
          </span>
        </q-td>
      </template>

      <template v-slot:bottom class="summary-row">
        <q-tr class="summary-tr">
          <q-td colspan="100%" class="text-right summary-row">{{summaryContent}}</q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldFixedList',
  mixins: [mixins.InputFieldMixin],
  emits:['input'],
  fieldInfo: {
    Category: 'Table',
    Label: '固定列表',
    Value: 'FixedList',
    demoData: [],
    Extra: [
      {
        Type: 'DynamicList',
        Label: '列',
        Name: 'Options.Columns',
        Options: {
          Columns: [
            {
              Label: '列标签',
              Name: 'Label',
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
            {
              Label: '样式',
              Name: 'style',
              Type: 'Text',
            },
          ],
        },
      },
      {
        Type: 'DynamicList',
        Label: '默认内容',
        Name: 'Options.Default',
        Options: {
          Default: [{}],
        },
      },
      {
        Type: 'String',
        Label: '统计信息模板',
        Name: 'Options.Summary.Pattern',
      },
      {
        Type: 'Number',
        Label: '统计信息保留位数',
        Name: 'Options.Summary.Digits',
        Default: 2,
      },
      {
        Type: 'DynamicList',
        Label: '统计信息字段',
        Name: 'Options.Summary.Fields',
        Options: {
          Columns: [
            {
              Label: '字段',
              Name: 'Field',
            },
            {
              Label: '统计方式',
              Name: 'Way',
              Type: 'Select',
              Options: [
                {
                  Label: '计数',
                  Value: 'count',
                },
                {
                  Label: '合计',
                  Value: 'sum',
                },
              ],
            },
          ],
        },
      },
    ],
    Description: '',
    onOptionsChanged: (editor, d, opt) => {
      if (!editor || !d || !opt || !opt.Extra) return;

      d.Options = d.Options || {};
      const theDefault = opt.Extra.find((ex) => ex.Name === 'Options.Default');
      if (theDefault) {
        theDefault.Options.Columns = d.Options.Columns;
        //editor.$set(
        //  theDefault.Options,
        //  'Columns',
        //  d.Options.Columns,
        //);
      }
    },
  },
  data() {
    return {
      tableData: [],
    };
  },
  computed: {
    tableTdClass() {
      return (index) => (((index || 0) % 2) ? 'col-zebra-even' : 'col-zebra-odd');
    },
    showCell() {
      return (p) => {
        const colNum = Number(p.col.name);

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(colNum)) return true;

        if (typeof p.row.rowSize !== 'undefined') {
          return colNum < p.row.rowSize && !!p.row[colNum];
        }
        return !!p.row[colNum];
      };
    },
    columns() {
      if (!this.Field || !this.Field.Options || !this.Field.Options.Columns) {
        return [];
      }

      const cls = [];
      this.Field.Options.Columns.forEach((c) => {
        const newC = { ...c };
        newC.name = c.Name;
        newC.label = c.Label;
        newC.field = c.Name;
        newC.required = c.required;
        newC.align = c.align || 'center';
        newC.sortable = c.sortable;
        newC.sort = c.sort;
        newC.format = c.format;
        newC.style = c.style;
        newC.classes = c.classes;
        newC.headerStyle = c.headerStyle;
        newC.headerClasses = c.headerClasses;

        delete newC.Name;
        delete newC.Label;

        // sort list
        if (newC.List && newC.List.length > 1) {
          newC.List = (newC.List || []).sort((a, b) => a.Index - b.Index);
        }

        cls.push(newC);
      });

      return cls;
    },
    columnField() {
      return (col, withLabel = false, pCol) => {
        const field = { ...(col.List ? col.List[0] : col) };
        field.Name = field.Name || field.name || field.field;

        if (withLabel) {
          field.Name = `${(pCol && pCol.field) ? `${pCol.field}.` : ''}${field.Name}`;
        } else {
          delete field.Label;
          delete field.label;
        }

        delete field.field;

        field.ReadOnly = this.Field.ReadOnly || field.ReadOnly;

        return field;
      };
    },
    summaryContent() {
      if (
        !this.tableData
        || !this.Field
        || !this.Field.Options
        || !this.Field.Options.Summary
        || !this.Field.Options.Summary.Pattern
      ) {
        return '';
      }
      let summaryText = this.Field.Options.Summary.Pattern;

      for (let i = 0; i < this.Field.Options.Summary.Fields.length; i += 1) {
        const sf = this.Field.Options.Summary.Fields[i];
        const fdList = this.tableData.filter((fd) => !!fd[sf.Field]);
        let vi = 0;

        switch (sf.Way) {
          case 'count':
            vi = this.tableData.filter((fd) => !!fd[sf.Field]).length;
            break;
          case 'sum':
            if (fdList) {
              fdList.forEach((fdv) => {
                vi += Number(fdv[sf.Field]) || 0;
              });
            }
            break;
          default:
            break;
        }

        // round vi
        vi = vi.toFixed(
          (this.Field
          && this.Field.Options
          && this.Field.Options.Summary
          && this.Field.Options.Summary.Digits)
          || 2,
        );

        summaryText = summaryText.replace(`$\{${i + 1}}`, vi);
      }
      return summaryText;
    },
  },
  watch: {
    fieldData() {
      if (this.fieldData) {
        this.tableData = this.fieldData;
        const dd = [];
        for (let i = 0; i < this.fieldData.length; i += 1) {
          const fd = this.fieldData[i];

          dd[i] = fd;
          if (typeof fd.rowSize !== 'undefined') {
            Object.keys(dd[i]).forEach((ddk) => {
              if (Number(ddk) && Number(ddk) > fd.rowSize) {
                delete dd[i][ddk];
              }
            });
          }
        }

        this.tableData = dd;
      }
    },
  },
  created() {
    if (!this.fieldData && this.Field.Options) {
      this.tableData = this.Field.Options.Default || [];
    }
  },
  methods: {
    cellChanged() {
      this.fieldData = this.tableData;
      this.$emit('input');
    },
  },
});
</script>
<style lang="sass">
.input-field-fixed-list
  .field-label
    margin-top: auto
    margin-bottom: auto
    margin-right: 8px
  .simple-field
    .q-field__control
      width: auto !important
      // max-width: 100% !important
</style>
