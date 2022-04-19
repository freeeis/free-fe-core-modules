<template>
  <div class="input-field-dynamic-list row">
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
    <q-table
      class="q-ma-xs col"
      :rows="tableData"
      :columns="columns"
      row-key="auto__index"
      :hide-bottom="!summaryContent"
      separator="cell"
      :pagination="{rowsPerPage:100000}"
      :ripple="false"
      :selection="selection"
      v-model:selected="selected"
    >
      <template
        v-slot:top
        v-if="Field.Warning || Field.showTop"
      >
        <slot name="warning"></slot>
        <slot name="top"></slot>
      </template>
      <template v-slot:header-cell-listActions="props">
        <q-th
          :props="props"
          style="width: 48px"
        >
          <slot
            name="header-actions"
            v-bind="props"
          >
            <e-icon
              v-if="showAddBtn"
              name="add"
              class="cursor-pointer"
              clickable
              @click="addRow()"
            />
          </slot>
        </q-th>
      </template>

      <template v-slot:body-cell="props">
        <q-td
          :props="props"
          v-if="props.col.name === 'listActions'"
        >
          <slot
            name="body-actions"
            v-bind="props"
          >
            <e-icon
              v-if="!Field || !Field.Options || !Field.Options.HideRemove"
              name="delete"
              class="cursor-pointer full-width text-center"
              clickable
              @click="deleteRow(props)"
            />
          </slot>
        </q-td>
        <q-td
          :props="props"
          v-else-if="showCell(props)"
          :colspan="props.value ? (props.value.colspan || '1') : '1'"
          :rowspan="props.value ? (props.value.rowspan || '1') : '1'"
          class="items-center justify-center"
        >
          <span
            v-if="props.col.List && props.col.List.length > 1"
            class="full-height full-width"
          >
            <free-field
              v-for="(col,index) in props.col.List"
              :key="index"
              :Field="columnField(col, true, props.col)"
              :values="props.row"
              @input="cellChanged"
              style="margin: 4px auto"
              :ref="`input_field_validator_${columnField(col, true, props.col).Name ||
                  columnField(col, true, props.col).Label}-${props.row.auto__index}`"
            ></free-field>
          </span>
          <span
            v-else
            class="full-height full-width"
          >
            <free-field
              :Field="columnField(props.col)"
              :values="props.row"
              @input="cellChanged"
              borderless
              :ref="`input_field_validator_extra_
                ${columnField(props.col).Name ||
                columnField(props.col).Label}-${props.row.auto__index}`"
            ></free-field>
          </span>
        </q-td>
      </template>

      <template
        v-slot:bottom
        class="summary-row"
      >
        <q-tr class="summary-tr">
          <q-td
            colspan="100%"
            class="text-right summary-td"
          >{{summaryContent}}</q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldDynamicList',
  mixins: [mixins.InputFieldMixin],
  emits: ['input', 'add', 'delete'],
  fieldInfo: {
    Category: 'Table',
    Label: '动态列表',
    Value: 'DynamicList',
    demoField: {
      Name: 'demo',
      Label: '动态列表标签',
      Options: {
        Columns: [{
          Label: '第一列',
          List: [{
            Name: 'CA',
            Placeholder: '请填写',
            Type: 'Number',
            Options: { MaxLength: 4 },
          }],
        }, {
          Label: '第二列',
          List: [{
            Name: 'CB',
            Type: 'String',
          }],
        }],
        Default: [{ }],
      },
    },
    demoData: [{
      CA: 'AA',
      CB: 'BB',
    }],
    Extra: [
      {
        Type: 'DynamicList',
        Label: '列',
        Name: 'Options.Columns',
        Options: {
          Columns: [
            {
              Label: 'Label',
              Name: 'Label',
            },
            {
              Label: 'Name',
              Name: 'Name',
              required: true,
            },
            {
              Label: 'Fields',
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
      {
        Type: 'DynamicList',
        Label: '默认内容',
        Name: 'Options.Default',
        Options: {
        },
      },
      {
        Type: 'Number',
        Label: '最少行数',
        Name: 'Options.MinRows',
      },
      {
        Type: 'Number',
        Label: '最大行数',
        Name: 'Options.MaxRows',
      },
      {
        Type: 'Boolean',
        Label: '可调整顺序',
        Name: 'Options.Sortable',
        Default: true
      },
      {
        Type: 'Boolean',
        Label: '不可添加',
        Name: 'Options.HideAdd',
      },
      {
        Type: 'Boolean',
        Label: '不可删除',
        Name: 'Options.HideRemove',
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
        //editor.$set(
        //  theDefault.Options,
        //  'Columns',
        //  d.Options.Columns,
        //);
        theDefault.Options.Columns = d.Options.Columns;
      }
    },
  },
  props: {
    readonly: { type: Boolean, default: false },
    selection: { type: String, default: 'none' },
  },
  data() {
    return {
      tableData: [],
      selected: [],
    };
  },
  computed: {
    showAddBtn() {
      if (!this.Field) return false;

      if (this.Field.Options
        && this.Field.Options.MaxRows
        && (this.tableData || []).length >= this.Field.Options.MaxRows) {
        return false;
      }

      if (this.Field && this.Field.Options && this.Field.Options.HideAdd) return false;

      return true;
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

      let cls = [];
      for (let i = 0; i < this.Field.Options.Columns.length; i += 1) {
        const c = this.Field.Options.Columns[i];

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

        newC.ReadOnly = this.readonly || c.ReadOnly;

        // sort list
        if (newC.List && newC.List.length > 1) {
          newC.List = (newC.List || []).sort((a, b) => a.Index - b.Index);
        }

        cls.push(newC);
      }

      if(this.Field.Options.Sortable && cls.findIndex(cl => cl.name === 'index') < 0) {
        cls = [
          {
            name: 'index',
            label: '#',
            // field : 'index',
            required : true,
            align : 'center',
            sortable : true,
            classes : 'index',
            List: [{
              Name: 'index',
              Type: 'Number',
              required : true,
              Placeholder: '请填写',
            }]
        },
        ...cls];
      }

      return cls.concat(
        this.Field.ReadOnly
          ? []
          : [
            {
              name: 'listActions',
              align: 'center',
            },
          ],
      );
    },
    fieldList() {
      return (l) => (l || []).sort((a, b) => a.Index - b.Index);
    },
    columnField() {
      return (col, withLabel = false, pCol) => {
        const field = { ...(col.List ? col.List[0] : col) };
        field.Name = field.Name || field.name || field.field;

        if (withLabel) {
          field.Name = `${(pCol && pCol.field) ? `${pCol.field}.` : ''}${field.Name}`;
        } else {
          delete field.label;
          delete field.Label;
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
      this.tableData = this.getSizedData(this.fieldData);
    },
    tableData() {
      if (this.tableData && this.tableData.length) {
        for (let i = 0; i < this.tableData.length; i += 1) {
          const td = this.tableData[i];

          td.auto__index = i;
        }
      }
    },
  },
  created() {
    if (!this.fieldData) {
      this.tableData = this.getSizedData(
        (this.Field.Options ? this.Field.Options.Default : []) || [],
      );
    } else {
      this.tableData = this.getSizedData(this.fieldData);
    }
  },
  methods: {
    getSizedData(d) {
      const dd = [];
      if (d) {
        for (let i = 0; i < d.length; i += 1) {
          const fd = d[i];

          dd[i] = fd;
          if (typeof fd.rowSize !== 'undefined') {
            Object.keys(dd[i]).forEach((ddk) => {
              if (Number(ddk) && Number(ddk) > fd.rowSize) {
                delete dd[i][ddk];
              }
            });
          }
        }

        if (this.Field.Options.MinRows) {
          for (let i = d.length; i < this.Field.Options.MinRows; i += 1) {
            dd.push({});
          }
        }
      }

      if (this.Field.Options && this.Field.Options.MaxRows) dd.splice(this.Field.Options.MaxRows);

      return dd;
    },
    cellChanged() {
      this.fieldData = this.tableData;
      this.$emit('input');
    },
    addRow(r) {
      if (!this.Field) return;

      if (this.Field && this.Field.Options && this.Field.Options.EmitEvent) {
        this.$emit('add');
        return;
      }

      this.tableData = this.tableData || [];
      if (this.Field.Options
        && this.Field.Options.MaxRows
        && this.tableData.length >= this.Field.Options.MaxRows) {
        return;
      }

      this.tableData.push(r || {});
      this.cellChanged();
    },
    deleteRow(p) {
      if (this.Field && this.Field.Options && this.Field.Options.EmitEvent) {
        this.$emit('delete', p.row);
        return;
      }

      this.tableData = this.tableData || [];
      if (this.Field.Options
        && this.Field.Options.MinRows
        && this.tableData.length <= this.Field.Options.MinRows) {
        return;
      }

      const removedIndex = this.tableData.findIndex(
        (td) => td.auto__index === p.row.auto__index,
      );
      if (removedIndex >= 0) {
        this.tableData.splice(removedIndex, 1);
        this.cellChanged();
      }
    },
  },
});
</script>
<style lang="sass">
.input-field-dynamic-list
  .simple-field
    .q-field__control
      width: auto !important
      // max-width: 100% !important
</style>
