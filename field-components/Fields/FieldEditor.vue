<template>
  <q-dialog
    v-model="Field.show"
    persistent
    maximized
    class="q-ma-xl"
  >
    <q-card
      class="input-field-editor q-ma-xl"
      style="height: calc(100% - 96px)"
    >
      <q-layout
        view="lHh Lpr lFf"
        container
      >
        <div>
          <slot name="warning"></slot>
        </div>
        <q-footer>
          <q-toolbar>
            <q-space></q-space>
            <q-btn
              icon="cancel"
              class="cancel-btn"
              :label="$t('cancelButtonText')"
              @click="cancelClicked"
            />
            <q-btn
              icon="save"
              class="save-btn"
              :label="$t('saveButtonText')"
              @click="saveClicked"
            />
          </q-toolbar>
        </q-footer>

        <q-page-container>
          <q-page padding>
            <span
              v-for="(field, fIndex) in Fields || []"
              :key="fIndex"
            >
              <free-field
                :values="fieldData.value"
                :Field="field"
                @input="fieldChanged"
                @updateOptions="fieldOptionsChanged"
              ></free-field>
            </span>
          </q-page>
        </q-page-container>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, getCurrentInstance, watchEffect } from 'vue';
import { useFreeField, freeFieldProps } from '../components/useFreeField';
import FieldTypeOptions from './components/FieldTypeOptions';

export default defineComponent({
  name: 'FieldEditor',
  emits: ['update:field', 'save', 'cancel'],
  fieldInfo: {
    Category: 'Advanced',
    Label: '字段编辑器',
    Value: 'FieldEditor',
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  setup(props, { emit }) {
    if (!props.Field) return {};

    const { proxy:vm } = getCurrentInstance();

    const { fieldData } = useFreeField(props);

    // const visible = ref(true);
    const Fields = [
        {
          Label: '基本信息',
          Type: 'Category',
        },
        {
          Type: 'Number',
          Label: '序号',
          Name: 'Index',
        },
        {
          Type: 'String',
          Label: '名称',
          Name: 'Name',
        },
        {
          Type: 'String',
          Label: '标签',
          Name: 'Label',
        },
        {
          Type: 'String',
          Label: '占位内容',
          Name: 'Placeholder',
        },
        {
          Type: 'String',
          Label: '默认值',
          Name: 'Default',
        },
        {
          Type: 'Check',
          Label: '必须',
          Name: 'Required',
        },
        {
          Type: 'Check',
          Label: '只读',
          Name: 'ReadOnly',
        },
        {
          Type: 'Select',
          Label: '类型',
          Name: 'Type',
          Component: FieldTypeOptions,
          Options: [],
        },
        {
          Type: 'Text',
          Label: '描述',
          Name: 'Description',
        },
        {
          Label: '高级设置',
          Type: 'Category',
        },
        {
          Type: 'Boolean',
          Label: '保持回传',
          Name: 'Info.KeepChanged',
          Description: '保存时，不管用户有没有修改此字段，都当作已经修改',
        },
        {
          Label: '数据校验规则',
          Name: 'Rules',
          Type: 'Select',
          Placeholder: '请选择',
          Multiple: true,
          Options: Object.keys(vm.ctx.validators).map((vlk) => {
            const name = vm.$t(`${vlk}Name`);
            const desc = vm.$t(`${vlk}Description`);
            return {
              Label: (name === `${vlk}Name`) ? vlk : name,
              Value: vlk,
              Tooltip: (desc === `${vlk}Description`) ? '' : desc,
            };
          }),
        },
        {
          Label: '唯一',
          Name: 'Info.Unique',
          Type: 'Boolean',
          Default: false,
        },
        {
          Label: '样式类',
          Name: 'Info.Classes',
          Type: 'String',
          Placeholder: '请填写附加样式类名，多个用空格分割。',
        },
        {
          Label: '样式',
          Name: 'Info.Style',
          Type: 'Text',
        },
        {
          Label: '不存在或为空时显示占位符',
          Name: 'Info.ShowNaN',
          Type: 'Check',
        },
        {
          Type: 'Text',
          Name: 'Info.ShowWhen',
          Label: '当条件满足时显示',
          Placeholder: '参数名为data的条件语句',
          Warning: '请确保填写正确！！！',
        },
        {
          Type: 'Boolean',
          Label: '隐藏',
          Name: 'Hidden',
          Extra: [
            {
              Type: 'Check',
              Label: '导出时包含',
              Description: '默认情况下隐藏字段不会被导出，但可勾选此项导出此隐藏字段',
              Name: 'Info.IncludedInExport',
              Default: false,
            },
            {
              Type: 'Check',
              Label: '只当数据不存在时隐藏',
              Name: 'Info.HideWhenUndefined',
              Default: false,
            },
            {
              Type: 'Check',
              Label: '空对象或数组将被认为数据不存在',
              Name: 'Info.IncludeEmptyObject',
              Default: false,
            },
            {
              Type: 'String',
              Label: '哪些字段不存在时隐藏',
              Name: 'Info.HideWhenUndefinedField',
              Placeholder: '多个字段名用逗号分割',
              Description: '默认为当前字段所关联的数据',
            },
          ],
        },
        {
          Type: 'String',
          Label: '警示信息',
          Name: 'Warning',
        },
        {
          Type: 'DynamicList',
          Label: '提示信息',
          Name: 'Tips',
          Options: {
            Columns: [
              {
                Label: '信息设置',
                Name: 'Text',
                Type: 'Text',
                style: 'min-width: 300px',
              },
              {
                Label: '超链接',
                Name: 'Links',
                Type: 'DynamicList',
                Options: {
                  Columns: [
                    {
                      Label: '显示的文字',
                      Name: 'Text',
                    },
                    {
                      Label: '超链接',
                      Name: 'Link',
                      style: 'min-width: 260px',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          Type: 'Select',
          Label: '引用类型',
          Name: 'ReferType',
          Default: '',
          Options: [
            {
              Label: '无',
              Value: '',
            },
            // {
            //   Label: '固定引用',
            //   Value: 'fixed',
            //   Extra: [
            //     {
            //       Type: 'String',
            //       Label: '引用内容',
            //       Name: 'ReferTo',
            //     },
            //   ],
            // },
            {
              Label: '字典引用',
              Value: 'dict',
              Extra: [
                {
                  Type: 'String',
                  Label: '引用内容',
                  Name: 'ReferTo',
                },
              ],
            },
            {
              Label: '数据库引用',
              Value: 'db',
              Extra: [
                {
                  Type: 'String',
                  Label: '引用内容',
                  Name: 'ReferTo',
                },
                {
                  Type: 'Check',
                  Label: '动态内容',
                  Name: 'Info.Dynamic',
                  Description: '不保存，每次都重新计算获取',
                },
              ],
            },
          ],
        },
        {
          Label: '外键',
          Name: 'Info.Refer',
          Type: 'String',
        },
        // {
        //   Type: 'Text',
        //   Label: '结构定义',
        //   Name: 'Schema',
        //
        // },
        // {
        //   Type: 'Text',
        //   Label: '自定义选项',
        //   Name: 'Options',
        //
        // },
        {
          Type: 'Category',
          Label: '所需权限',
        },
        {
          Type: 'Permission',
          Label: '需要的权限',
          Name: 'Permission',
          ServiceList: '_service_list',
        },
      ];


    const fieldOptionsChanged = (field) => {
      if (!field || !field.Name || !field.Options) return;

      const fListField = Fields.find((f) => f.Name === field.Name);
      if (fListField) {
        fListField.Options = field.Options;
      }
    };
    const fieldChanged = (field) => {
      if (!field || !field.Name) return;

      if (field.Name === 'Type' || field.Name.startsWith('Options.')) {
        // when the field is fixed list, we have to set columns for the default value list

        // TODO: do we need this?
        // fieldData.value.Options = fieldData.value?.Options || {};
        // const fListField = Fields.find((f) => f.Name === 'Type');
        // if (fListField) {
        //   const theOpt = fListField.Options.find((op) => op.Value === fieldData.value?.Type);
        //   if (theOpt && theOpt.onOptionsChanged) {
        //     theOpt.onOptionsChanged(vm, fieldData.value, theOpt);
        //   }
        // }
      }

      emit('update:field', field.Name);
    };

    watchEffect(() => {
      if(props.Field.show) {
        fieldChanged(Fields.find((f) => f.Name === 'Type'));
      }
    });

    return {
      fieldData,
      Fields,
      fieldOptionsChanged,
      fieldChanged,
      saveClicked: () => {
        emit('save');
      },
      cancelClicked: () => {
        // TODO: when click cancel, we should rollback the field data
        emit('cancel');
      },
    };
  },
});
</script>

<style lang="sass" scoped>
.q-dialog .fullscreen
  background: white

.cancel-btn
  margin-right: 12px
</style>
