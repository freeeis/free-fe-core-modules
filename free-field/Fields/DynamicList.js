import { ref, defineComponent, getCurrentInstance, h, computed, watchEffect } from 'vue';
import { QTable, QTh, QTd, QTr, QIcon } from 'quasar';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import freeFieldLabel from '../composible/freeFieldLabel';
import FreeField from '../composible/fieldWrapper';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldDynamicList',
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
    ...freeFieldProps,
    readonly: { type: Boolean, default: false },
    selection: { type: String, default: 'none' },
  },
  emits: ['input', 'add', 'delete'],
  setup(props, { emit, slots, expose }){
    if (!props.Field) {
      return () => null;
    }

    const { fieldData, setFieldData } = useFreeField(props);

    const tableData = ref([]);
    const selected = ref([]);

    const getSizedData = (d) => {
      const dd = [];
      if (d) {
        for (let i = 0; i < d.length; i += 1) {
          const fd = d[i];

          dd[i] = fd;
          if (fd.rowSize !== void 0) {
            Object.keys(dd[i]).forEach((ddk) => {
              if (Number(ddk) && Number(ddk) > fd.rowSize) {
                delete dd[i][ddk];
              }
            });
          }
        }

        if (props.Field.Options?.MinRows) {
          for (let i = d.length; i < props.Field.Options?.MinRows; i += 1) {
            dd.push({});
          }
        }
      }

      if (props.Field.Options?.MaxRows) dd.splice(props.Field.Options?.MaxRows);

      return dd;
    };

    watchEffect(() => {
      tableData.value = getSizedData(fieldData.value);
    });

    watchEffect(() => {
      if (tableData.value?.length) {
        for (let i = 0; i < tableData.value.length; i += 1) {
          const td = tableData.value[i];

          td.auto__index = i;
        }
      }
    });

    const before = (props.Field.Label !== void 0) ? h(freeFieldLabel, {
      Field: props.Field,
    }) : undefined;

    const showAddBtn = computed(() => {
      if (props.Field.Options?.MaxRows
        && (props.tableData || []).length >= props.Field.Options?.MaxRows) {
        return false;
      }

      if (props.Field.Options?.HideAdd) return false;

      return true;
    });

    const showCell = (p) => {
      const colNum = Number(p.col.name);

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(colNum)) return true;

      if (p.row.rowSize !== void 0) {
        return colNum < p.row.rowSize && !!p.row[colNum];
      }
      return !!p.row[colNum];
    };;

    const columns = computed(() => {
      if (!props.Field.Options?.Columns) {
        return [];
      }

      let cls = [];
      for (let i = 0; i < props.Field.Options?.Columns?.length; i += 1) {
        const c = props.Field.Options.Columns[i];

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

        newC.ReadOnly = props.readonly || c.ReadOnly;

        // sort list
        if (newC.List && newC.List.length > 1) {
          newC.List = (newC.List || []).sort((a, b) => a.Index - b.Index);
        }

        cls.push(newC);
      }

      if(props.Field.Options?.Sortable && cls.findIndex(cl => cl.name === 'index') < 0) {
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
        props.Field.ReadOnly
          ? []
          : [
            {
              name: 'listActions',
              align: 'center',
            },
          ],
      );
    });

    const columnField = (col, withLabel = false, pCol) => {
      const field = { ...(col.List ? col.List[0] : col) };
      field.Name = field.Name || field.name || field.field;

      if (withLabel) {
        field.Name = `${(pCol && pCol.field) ? `${pCol.field}.` : ''}${field.Name}`;
      } else {
        delete field.label;
        delete field.Label;
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
      let summaryText = props.Field.Options?.Summary?.Pattern;

      for (let i = 0; i < props.Field.Options?.Summary?.Fields?.length; i += 1) {
        const sf = props.Field.Options?.Summary?.Fields[i];
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
          props.Field.Options?.Summary?.Digits || 2,
        );

        summaryText = summaryText.replace(`$\{${i + 1}}`, vi);
      }
      return summaryText;
    })

    const cellChanged = () => {
      setFieldData(tableData.value, emit);
    }

    const addRow = (r) => {
      if (props.Field.Options?.EmitEvent) {
        emit('add');
        return;
      }

      tableData.value = tableData.value || [];
      if (props.Field.Options?.MaxRows
        && tableData.value.length >= props.Field.Options?.MaxRows) {
        return;
      }

      tableData.value.push(r || {});
      cellChanged();
    };

    const deleteRow = (p) => {
      if (props.Field.Options?.EmitEvent) {
        emit('delete', p.row);
        return;
      }

      tableData.value = tableData.value || [];
      if (props.Field.Options?.MinRows
        && tableData.value.length <= props.Field.Options?.MinRows) {
        return;
      }

      const removedIndex = tableData.value.findIndex(
        (td) => td.auto__index === p.row.auto__index,
      );
      if (removedIndex >= 0) {
        tableData.value.splice(removedIndex, 1);
        cellChanged();
      }
    };

    const fieldsToValidate = ref([]);
    const {
      validate
    } = useFormValidator(fieldsToValidate);

    expose({
      selected,
      addRow,
      deleteRow,
      validate,
    })

    watchEffect(() => {
      tableData.value = getSizedData(fieldData.value);
    });


    const top = () => [slots.warning && slots.warning(), slots.top && slots.top()];
    const headerCellListActions = (slotProps) => h(QTh, {
      props: slotProps,
      style: 'width: 48px',
    },
    {
      default: () => slots['header-actions'] ? slots['header-actions'](slotProps) :
      (showAddBtn.value && h(QIcon,
        {
          name: 'add',
          class:  'cursor-pointer',
          clickable: true,
          onClick: () => {
            addRow();
          },
        }
      ))
    }
    );

    const bodyCell = (slotProps) => {
      const fields = ref([]);
      fields.value = slotProps.col?.List?.length > 1 ? slotProps.col.List.map((col) =>
        h(FreeField, {
          Field: columnField(col, true, slotProps.col),
          values: slotProps.row,
          style: "margin: 4px auto",
          onInput: cellChanged,
        })
      ) : [
        h(FreeField, {
          Field: columnField(slotProps.col),
          values: slotProps.row,
          borderless: true,
          onInput: cellChanged,
        }),
      ];

      // add fields from the current cell to validate list
      fieldsToValidate.value.push(...fields.value);


      if (slotProps.col.name === "listActions") {
        return h(QTd, null, {
          default: () =>
            slots["body-actions"]
              ? slots["body-actions"](slotProps)
              : !props.Field.Options?.HideRemove &&
                h(QIcon, {
                  name: "delete",
                  class: "cursor-pointer full-width text-center",
                  clickable: true,
                  onClick: () => {
                    deleteRow(slotProps);
                  },
                }),
        });
      } else if (showCell(slotProps)) {
        return h(
          QTd,
          {
            props: slotProps,
            colspan: slotProps.value ? slotProps.value.colspan || "1" : "1",
            rowspan: slotProps.value ? slotProps.value.rowspan || "1" : "1",
            class: "items-center justify-center",
            style: "padding:0;margin:0;height:auto;width:auto",
          },
          () => h(
            "span",
            {
              class: "full-height full-width",
            },
            fields.value,
          )
        );
      }
    };

    const bottom = () => h(QTr, {
      class: 'summary-tr',
    },[h(QTd, {
      colspan: '100%',
      class: 'text-right summary-td'
    }, [summaryContent.value])]);

    const tableNode = () => h(QTable,
      {
        flat: true,
        bordered: true,
        class:"q-ma-xs col",
        style: props.Field.Info?.Style,
        'hide-bottom':!summaryContent.value,
        separator: 'cell',
        pagination: {rowsPerPage:100000},
        ripple: false,

        rules: props.Field.Rules,
        'row-key':"auto__index",

        rows: tableData.value,
        columns: columns.value,
        selection: props.selection,
        selected: selected.value,
        'onUpdate:selected': (v) => {
          selected.value = v;
          emit('input', v);
        },
      },
      {
        top: (props.Field.Warning || props.Field.showTop) && top,
        'header-cell-listActions': headerCellListActions,
        'body-cell': bodyCell,
        bottom,
      }
    );


    return () => h('div', {
      class: 'free-field-dynamic-list row',
    }, [
      before,
      tableNode(),
    ]);
  },
});
