<template>
  <div class="input-field-mixed-table row">
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
    <q-table
      class="q-ma-xs col"
      :rows="[{}]"
      :columns="columns"
      row-key="auto__index"
      hide-header
      :hide-bottom="!summaryContent"
      separator="cell"
      :pagination="{rowsPerPage:100000}"
    >
      <template
        v-slot:top
        v-if="Field && Field.Warning"
      >
        <slot name="warning"></slot>
      </template>
      <template v-slot:body>
        <q-tr
          v-for="(r,index) in Field.Options.Rows"
          :key="index"
          :class="((index || 0) % 2) ? 'row-zebra-odd' : 'row-zebra-even'"
        >
          <q-td
            v-for="(rk, rkIndex) in rowCells(r)"
            :key="rkIndex"
            :rowspan="r[rk].rowspan"
            :colspan="r[rk].colspan"
            class="items-center justify-center"
          >
            <span
              v-if="r[rk].List && r[rk].List.length > 1"
              class="full-width full-height"
            >
              <free-field
                v-for="(f,fIndex) in r[rk].List"
                :key="fIndex"
                :Field="{...f, ReadOnly: Field.ReadOnly || f.ReadOnly}"
                :values="fieldData.value"
                @input="cellChanged(f)"
                :ref="`input_field_validator_${index}`"
              ></free-field>
            </span>
            <span
              v-else-if="r[rk].List && r[rk].List[0]"
              class="full-width full-height"
            >
              <free-field
                :Field="{...r[rk].List[0], ReadOnly: Field.ReadOnly || r[rk].List[0].ReadOnly}"
                :values="fieldData.value"
                @input="cellChanged(r[rk].List[0])"
                borderless
                :ref="`input_field_validator_extra_${index}`"
              ></free-field>
            </span>
          </q-td>
        </q-tr>
      </template>

      <template
        v-slot:bottom
      >
        <q-tr class="summary-tr">
          <q-td
            colspan="100%"
            class="text-right summary-td"
          >{{summaryContent}}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue';
import { useFreeField, freeFieldProps } from '../components/useFreeField';

export default defineComponent({
  name: 'InputFieldMixedTable',
  emits:['input'],
  fieldInfo: {
    Category: 'Table',
    Label: '自由表格',
    Value: 'MixedTable',
    Extra: [
      {
        Type: 'Number',
        Name: 'Options.ColumnNumber',
        Label: '列数',
      },
      {
        Type: 'DynamicList',
        Label: '定义',
        Name: 'Options.Rows',
        Options: {
          Columns: [{}],
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
          ],
        },
      },
    ],
    Description: '',
    onOptionsChanged: (editor, d, opt) => {
      if (!editor || !d || !opt || !opt.Extra) return;

      // auto set rows and columns
      d.Options = d.Options || {};

      const cols = d.Options.ColumnNumber || 0;

      const mTableFieldRows = opt.Extra.find(
        (e) => e.Name === 'Options.Rows',
      );
      if (mTableFieldRows) {
        const mtfrColumns = [
          {
            Label: '',
            Name: 'auto__index',
            ReadOnly: true,
          },
        ];

        for (let ii = 0; ii < cols; ii += 1) {
          mtfrColumns.push({
            Label: `${ii + 1}`,
            Name: `${ii}`,
            Type: 'FixedList',
            List: [
              {
                Label: 'rowspan',
                Name: 'rowspan',
                Type: 'Number',
              },
              {
                Label: 'colspan',
                Name: 'colspan',
                Type: 'Number',
              },
              {
                Name: 'List',
                Type: 'FieldList',
                Options: {
                  Columns: [
                    {
                      Label: '类型',
                      Name: 'Type',
                      style: 'max-width: 120px;',
                    },
                    {
                      Label: '名称',
                      Name: 'Name',
                      style: 'max-width: 200px;',
                    },
                    {
                      Label: '标题',
                      Name: 'Label',
                      style: 'max-width: 200px;',
                    },
                    {
                      Label: '默认',
                      Name: 'Default',
                      style: 'max-width: 200px;',
                    },
                  ],
                },
              },
            ],
          });
        }

        //editor.$set(mTableFieldRows.Options, 'Columns', mtfrColumns);
        mTableFieldRows.Options.Columns = mtfrColumns;

        // table rows and columns correction
        const rowColNumbers = [];
        d.Options.Rows = d.Options.Rows || [];
        for (let i = 0; i < d.Options.Rows.length; i += 1) {
          d.Options.Rows[i] = d.Options.Rows[i] || {};

          // set data row index
          d.Options.Rows[i].auto__index = `${i + 1}`;

          // limit rowspan and colspan
          if (typeof rowColNumbers[i] === 'undefined') {
            rowColNumbers[i] = d.Options.ColumnNumber;
          } else {
            rowColNumbers[i] += d.Options.ColumnNumber;
          }

          for (let j = 0; j < rowColNumbers[i]; j += 1) {
            // col span
            d.Options.Rows[i][j] = d.Options.Rows[i][j] || {};
            let colSpan = d.Options.Rows[i][j].colspan || 1;
            colSpan = colSpan || 1;
            if (colSpan > rowColNumbers[i] - j) {
              colSpan = rowColNumbers[i] - j;
              d.Options.Rows[i][j].colspan = rowColNumbers[i] - j;
            }

            rowColNumbers[i] -= colSpan - 1;

            // row span
            let rowSpan = d.Options.Rows[i][j].rowspan || 1;
            rowSpan = rowSpan || 1;
            if (rowSpan > d.Options.Rows.length - i) {
              rowSpan = d.Options.Rows.length - i;
              d.Options.Rows[i][j].rowspan = d.Options.Rows.length - i;
            }
            for (let k = 1; k < rowSpan; k += 1) {
              if (typeof rowColNumbers[i + k] === 'undefined') {
                rowColNumbers[i + k] = 0;
              }
              rowColNumbers[i + k] -= colSpan;
            }
          }
        }

        for (let i = 0; i < d.Options.Rows.length; i += 1) {
          // this.data.Options.Rows[i].rowSize = rowColNumbers[i];
          // remove extra cells according to the span
          const newRow = { rowSize: rowColNumbers[i] };
          for (let j = 0; j < rowColNumbers[i]; j += 1) {
            newRow[j] = d.Options.Rows[i][j];
          }
          // this.data.Options.Rows[i] = newRow;
          //editor.$set(d.Options.Rows, i, newRow);
          d.Options.Rows[i] = newRow;
        }
      }
    },
  },
  props: {
    ...freeFieldProps,
  },
  setup(props, { emit }) {
    if (!props.Field) return () => null;

    const { fieldData, setFieldData } = useFreeField(props);

    const rowCells = (r) => {
      if (!r) return [];
      return Object.keys(r).filter(
        (rkk) => {
          if (!rkk) return false;

          return !isNaN(Number(rkk)) && Number(rkk) < r.rowSize;
        },
      );
    };

    const columns = computed(() => {
      if (!props.Field.Options?.Rows) return [];

      let cols = 0;
      for (let i = 0; i < props.Field.Options.Rows.length; i += 1) {
        const r = props.Field.Options.Rows[i];

        for (let j = 0; j < Object.keys(r).length; j += 1) {
          const rk = Number(Object.keys(r)[j]);
          if (rk > cols) cols = rk;

          // sort list
          if (r[rk] && r[rk].List && r[rk].List.length > 1) {
            r[rk].List = (r[rk].List || []).sort((a, b) => a.Index - b.Index);
          }
        }
      }

      const ret = [];
      for (let i = 0; i <= cols; i += 1) {
        ret.push({});
      }

      return ret;
    })

    const summaryContent = computed(() => {
      if (
        !fieldData.value
        || !props.Field.Options?.Summary?.Pattern
      ) {
        return '';
      }
      let summaryText = props.Field.Options.Summary.Pattern;

      for (let i = 0; i < props.Field.Options.Summary.Fields.length; i += 1) {
        const sf = props.Field.Options.Summary.Fields[i];
        const fList = (sf || '').Field.split(',');
        let vi = 0;
        for (let j = 0; j < fList.length; j += 1) {
          const ff = fList[j];

          vi += Number(Object.nestValue(fieldData.value, ff.trim())) || 0;
        }

        // round vi
        vi = vi.toFixed(
          props.Field.Options?.Summary?.Digits || 2,
        );

        summaryText = summaryText.replace(`$\{${i + 1}}`, vi);
      }
      return summaryText;
    });

    return {
      fieldData,
      setFieldData,

      rowCells,
      columns,
      summaryContent,

      cellChanged: (f) => {
        emit('input', f);
      },
    }
  },
});
</script>
