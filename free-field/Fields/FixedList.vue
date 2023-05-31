<template>
  <div class="free-field-fixed-list row">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.Label !== void 0"
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
          style="text-align: center;padding:0;margin:0;height:auto;width:auto;"
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
          style="padding:0;margin:0;height:auto;width:auto;"
        >
          <span v-if="props.col.List && props.col.List.length > 1" class="full-width full-height">
            <free-field
              v-for="(col,index) in props.col.List"
              :key="index"
              :Field="columnField(col, true, props.col)"
              :values="props.row"
              @input="cellChanged()"
              ref="fieldsToValid"
            ></free-field>
          </span>
          <span v-else class="full-width full-height">
            <free-field
              :Field="columnField(props.col, false)"
              :values="props.row"
              @input="cellChanged()"
              borderless
              ref="fieldToValid"
            ></free-field>
          </span>
        </q-td>
      </template>

      <template v-slot:bottom>
        <q-tr class="summary-tr">
          <q-td colspan="100%" class="text-right summary-row">{{summaryContent}}</q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { defineComponent, watchEffect, ref, computed } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldFixedList',
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
  props: {
    ...freeFieldProps,
  },
  setup(props, { emit, expose }) {
    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);
    const tableData = ref(props.Field.Options?.Default || []);

    watchEffect(() => {
      if (fieldData.value) {
        const dd = [];
        for (let i = 0; i < fieldData.value.length; i += 1) {
          const fd = fieldData.value[i];

          dd[i] = fd;
          if (fd.rowSize !== void 0) {
            Object.keys(dd[i]).forEach((ddk) => {
              if (Number(ddk) && Number(ddk) > fd.rowSize) {
                delete dd[i][ddk];
              }
            });
          }
        }

        tableData.value = dd;
      }
    })

    const tableTdClass = (index) => (((index || 0) % 2) ? 'col-zebra-even' : 'col-zebra-odd');
    const showCell = (p) => {
        const colNum = Number(p.col.name);

        // eslint-disable-next-line no-restricted-globals
        if (isNaN(colNum)) return true;

        if (p.row.rowSize !== void 0) {
          return colNum < p.row.rowSize && !!p.row[colNum];
        }
        return !!p.row[colNum];
    };

    const columns = computed(() => {
      if (!props.Field.Options?.Columns) {
        return [];
      }

      const cls = [];
      props.Field.Options.Columns.forEach((c) => {
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
    });

    const columnField  = (col, withLabel = false, pCol) => {
      const field = { ...(col.List ? col.List[0] : col) };
      field.Name = field.Name || field.name || field.field;

      if (withLabel) {
        field.Name = `${(pCol && pCol.field) ? `${pCol.field}.` : ''}${field.Name}`;
      } else {
        delete field.Label;
        delete field.label;
      }

      delete field.field;

      field.ReadOnly = props.Field.ReadOnly || field.ReadOnly;

      return field;
    };

    const summaryContent = computed(() => {
      if (
        !tableData.value
        || !props.Field.Options?.Summary?.Pattern
      ) {
        return '';
      }
      let summaryText = props.Field.Options.Summary.Pattern;

      for (let i = 0; i < props.Field.Options.Summary.Fields.length; i += 1) {
        const sf = props.Field.Options.Summary.Fields[i];
        const fdList = tableData.value.filter((fd) => !!fd[sf.Field]);
        let vi = 0;

        switch (sf.Way) {
          case 'count':
            vi = tableData.value.filter((fd) => !!fd[sf.Field]).length;
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
          (this.Field.Options?.Summary?.Digits)
          || 2,
        );

        summaryText = summaryText.replace(`$\{${i + 1}}`, vi);
      }
      return summaryText;
    });

    const cellChanged = () => {
      setFieldData(tableData.value, emit);
    };

    const { validate } = useFormValidator('fieldsToValid', 'fieldToValid')
    expose({
      validate,
    })

    return {
      fieldData,
      tableData,
      tableTdClass,
      showCell,
      columns,
      columnField,
      summaryContent,
      cellChanged,
    };
  },
});
</script>
<style lang="sass">
.free-field-fixed-list
  .field-label
    margin-top: auto
    margin-bottom: auto
    margin-right: 8px
  .simple-field
    .q-field__control
      width: auto !important
      // max-width: 100% !important
</style>
