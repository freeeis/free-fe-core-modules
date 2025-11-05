<template>
  <span :class="(Field && Field.AsCheck) ? 'free-field-select' :
    'free-field-select simple-field row'">
    <span v-if="!Field.AsCheck" class="row no-wrap items-center full-width inline-block">
      <span v-if="Field.ReadOnly" class="full-width">
        <span :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
          ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`" v-if="Field.Label !== void 0">
          <q-tooltip v-if="Field.Description" anchor="top right">{{ $t(Field.Description) }}</q-tooltip>
          {{ $t(Field.Label) || '' }}
          <span v-if="Field.Required" class="required-mark">*</span>
        </span>
        <span class="readonly-content">
          <span class="prefix" v-if="Field.Info && Field.Info.Prefix">
            {{ Field.Info.Prefix }}
          </span>
          <div v-if="Field.Info && Field.Info.Chip">
            <q-chip v-bind="Field.Info.ChipOptions || {}" v-for="(opt, idx) in readonlyContent || []" :key="idx">
              {{ opt }}
            </q-chip>
          </div>
          <span v-else :style="(Field.Info && Field.Info.Style) ? Field.Info.Style : ''">
            {{ readonlyContent }}
          </span>
          <span class="postfix" v-if="Field.Info && Field.Info.Postfix">{{ Field.OptiInfons.Postfix }}</span>
        </span>
      </span>

      <q-select v-else popup-content-class="free-field-select-control" hide-bottom-space :modelValue="fieldData.value"
        @update:modelValue="selectChanged" :options="localOptions" option-value="Value" option-label="Label" map-options
        emit-value :label="Field.Placeholder || $t(getModule('core-modules').config['defaultSelectFieldPlaceholder'])"
        :multiple="Field.Multiple" :readonly="Field.ReadOnly" ref="fieldToValid"
        :use-input="Field && (Field.UseInput || (Field.Info?.CanFilter))" @filter="filterFunc"
        :use-chips="Field && (Field.UseChip || (Field.Info && Field.Info.Chip))" v-bind="inputControlSettings"
        :rules="Field.Rules" :new-value-mode="Field?.NewValueMode ? 'add' : undefined">
        <template v-slot:before>
          <span :class="`field-label ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`" v-if="Field.Label !== void 0">
            <q-tooltip v-if="Field.Description" anchor="top right">{{ $t(Field.Description) }}</q-tooltip>
            {{ $t(Field.Label) || '' }}
            <span v-if="Field.Required" class="required-mark">*</span>
          </span>
        </template>

        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps || {}" v-on="scope.itemEvents || {}">
            <q-item-section avatar v-if="scope.opt.Icon">
              <e-icon :name="scope.opt.Icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label v-dompurify-html="scope.opt.Label" />
              <q-tooltip v-if="scope.opt.Tooltip">
                {{ scope.opt.Tooltip }}
              </q-tooltip>
              <!-- <q-item-label caption v-if="scope.opt.Description" class="ellipsis">
                {{ scope.opt.Description }}
              </q-item-label> -->
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <slot name="warning"></slot>
    </span>
    <span v-else class="free-field-select-ascheck row items-start no-wrap">
      <span :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`" v-if="Field.Label !== void 0">
        <q-tooltip v-if="Field.Description" anchor="top right">{{ $t(Field.Description) }}</q-tooltip>
        {{ $t(Field.Label) || '' }}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="column items-start no-wrap">
        <div>
          <slot name="warning"></slot>
        </div>
        <div class="checkbox-list row" :class="hasError ? 'free-field--error' : ''">

          <div class="free-field--error-tag" v-if="hasError">
            <e-icon name="error"></e-icon>
          </div>

          <div
            class="option-item"
            :class="{
              padding: option.opt?.PaddingLeft,
            }"
            v-for="(option, index) in Field.Options" 
            :key="index" >

            <div 
              class="just-a-label"
              v-if="option.opt?.asLabel">{{ option.Label }}</div>

            <q-checkbox 
              v-else
              :class="{
                checked: checked.includes(option.Value),
                'with-inner-extra': option.InnerExtra?.length,
              }" 
              hide-bottom-space 
              :label="option.Label || ''" 
              v-model="checked" 
              :val="option.Value"
              :disable="Field.ReadOnly" 
              @update:modelValue="checkChanged(option.Value)"
              :checked-icon="checkedIcon(option)">
              <q-tooltip v-if="option.opt?.Tooltip" anchor="bottom middle">
                {{ $t(option.opt.Tooltip) || '' }}
              </q-tooltip>
              <div class="option-inner-extra" 
                v-if="(fieldData === option.Value || (fieldData && fieldData.indexOf && (fieldData.indexOf(option.Value) >= 0))) && option.InnerExtra?.length">
                <free-field 
                  @click.stop
                  @keydown.stop
                  @keypress.stop
                  @keyup.stop
                  @input="innerExtraFieldInput(fld)"
                  v-for="(fld, idx) in option.InnerExtra || []" :key="idx" 
                  :Field="{...fld, ReadOnly: Field.ReadOnly || fld.ReadOnly}"
                  :values="data"
                  ref="fieldToValid"></free-field>
              </div>
            </q-checkbox>
          </div>
        </div>
      </span>
    </span>
  </span>
</template>

<script>
import { ref, computed, defineComponent, getCurrentInstance, watchEffect } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField.js';
import { useFormValidator} from '../../composible/useFormValidator.js';

const NUM_ICONS = [
  '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
  '⑪', '⑫', '⑬', '⑭', '⑮','⑯','⑰','⑱','⑲','⑳',
  '㉑','㉒','㉓','㉔','㉕','㉖','㉗','㉘','㉙','㉚',
  '㉛','㉜','㉝','㉞','㉟','㊱','㊲','㊳','㊴','㊵',
  '㊶','㊷','㊸','㊹','㊺','㊻','㊼','㊽','㊾','㊿'];

export default defineComponent({
  name: 'InputFieldSelect',
  props: {
    ...freeFieldProps,
  },
  emits:['input'],
  fieldInfo: {
    Category: 'Simple',
    Label: '选择',
    Value: 'Select',
    Description: '',
    Extra: [
      {
        Type: 'String',
        Label: '前缀',
        Name: 'Info.Prefix',
      },
      {
        Type: 'String',
        Label: '后缀',
        Name: 'Info.Postfix',
      },
      {
        Type: 'Check',
        Label: '展开单选',
        Name: 'AsRadio',
      },
      {
        Type: 'Check',
        Label: '展开勾选',
        Name: 'AsCheck',
      },
      {
        Type: 'Check',
        Label: '可多选',
        Name: 'Multiple',
      },
      {
        Type: 'Check',
        Label: '显示为顺序号',
        Name: 'Info.AsOrderNumber',
      },
      {
        Type: 'Check',
        Label: '显示为碎屑',
        Name: 'Info.Chip',
      },
      {
        Type: 'Check',
        Label: '可筛选',
        Name: 'Info.CanFilter',
      },
      {
        Type: 'String',
        Name: 'Info.Url',
        Label: '获取选项的url',
      },
      {
        Type: 'String',
        Name: 'Info.Params',
        Label: '获取选项的参数字段',
        Placeholder: '逗号分割多个参数字段名',
      },
      {
        Type: 'String',
        Name: 'Info.TriggerTo',
        Label: '选择后激活字段',
        Placeholder: '逗号分割多个参数字段名',
      },
      {
        Type: 'DynamicList',
        Label: '选项',
        Name: 'Options',
        Options: {
          Columns: [
            {
              Label: 'Label',
              Name: 'Label',
            },
            {
              Label: 'Value',
              Name: 'Value',
            },
            {
              Label: 'Tooltip',
              Name: 'opt.Tooltip',
            },
            {
              Label: 'Extra',
              Name: 'Extra',
              Type: 'FieldList',
              Options: {
                Columns: [
                  {
                    Label: '#',
                    Name: 'Index',
                    sortable: true,
                  },
                  {
                    Label: '名称',
                    Name: 'Name',
                    style: 'max-width: 200px;',
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
            {
              Label: 'InnerExtra',
              Name: 'InnerExtra',
              Type: 'FieldList',
              Options: {
                Columns: [
                  {
                    Label: '#',
                    Name: 'Index',
                    sortable: true,
                  },
                  {
                    Label: '名称',
                    Name: 'Name',
                    style: 'max-width: 200px;',
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
    ],
  },
  setup(props, { emit, expose }) {
    if (!props.Field) return () => null;

    const { proxy:vm } = getCurrentInstance();

    const { fieldData, getFieldData, setFieldData, inputControlSettings } = useFreeField(props);

    const hasError = ref(false);
    const checked = ref([]);
    const dependencies = ref({});
    const selectOptions = ref([]);

    watchEffect(() => {
      if (Array.isArray(props.Field.Options)) {
        selectOptions.value = props.Field.Options;
      }
    });

    const readonlyContent = computed(() => {
      if (Array.isArray(props.Field.Options)) {
        let valueList;
        if (props.Field.Multiple) {
          if (Array.isArray(fieldData.value)) {
            valueList = fieldData.value;
          } else if (typeof fieldData.value === 'string') {
            valueList = fieldData.value.split(',');
          }
        } else {
          valueList = [fieldData.value];
        }

        const labelList = [];
        (valueList || []).forEach((vl) => {
          const theOpt = props.Field.Options.find((opt) => opt.Value === vl);
          if (theOpt) labelList.push(theOpt.Label || fieldData.value);
          else labelList.push(vl);
        });

        return labelList.join(',');
      }

      return fieldData.value;
    });

    const checkedIcon = computed(() => {
      // only when ascheck and multiple and as order number
      if (props.Field?.AsCheck && props.Field?.Multiple && props.Field?.Info?.AsOrderNumber) {
        return (opt) => {
          if (!opt?.Value) return undefined;

          const idx = (checked.value || []).findIndex((v) => v === opt.Value);

          if (idx >= 0 && idx < NUM_ICONS.length) {
            return NUM_ICONS[idx];
          }

          return undefined;
        };
      }

      return () => undefined;
    });


    watchEffect(() => {
      if (props.Field.AsCheck) {
        if (fieldData.value) {
          checked.value = `${fieldData.value}`.split(',');
        } else {
          checked.value = [];
        }
      }
    });

    const selfValidate = () => {
      const isValid = checked.value && checked.value.length > 0;
      hasError.value = !isValid;
      return isValid;
    };

    const { validate } = useFormValidator('fieldToValid');

    if (props.Field.AsCheck && props.Field.Required) {
      expose ({
        validate,
        selfValidate,
      })
    } else {
      expose ({
        validate,
      })
    }

    const selectChanged = (v) => {
      selfValidate();
      setFieldData(v, emit);
    };

    const checkChanged = (v) => {
      selfValidate();

      if (!props.Field.Multiple && checked.value.indexOf(v) >= 0) {
        checked.value = [v];
      }

      setFieldData(checked.value.join(','), emit);
    };

    const apiCall = () => {
      if (!props.Field.Info?.Url) {
        return;
      }

      const paramObj = {};
      let params = props.Field.Info.Params || '';
      if (params.length > 0) {
        if (typeof params === 'string') {
          params = params.split(',');
        }
        for (let i = 0; i < params.length; i += 1) {
          const param = params[i];

          if (param) {
            paramObj[param] = getFieldData(param);
            dependencies.value[param] = getFieldData(param);
          }
        }
      }

      vm.postRequest(props.Field.Info.Url, paramObj).then((d) => {
        if (d && d.msg === 'OK') {
          if (d.data && d.data.options) {
            selectOptions.value = d.data.options;
            if (d.data.options.findIndex((o) => o.Value === fieldData.value) < 0) {
              setFieldData(undefined, emit);
            }
          } else {
            selectOptions.value = [];
          }
        }
      });
    };

    watchEffect(() => {
      if (!props.Field.Info?.Url || !props.values) return;

      const params = props.Field.Info?.Params || '';
      if (params) {
        const paramList = typeof params === 'string' ? params.split(',') : params;

        for (let i = 0; i < paramList.length; i += 1) {
          if (getFieldData(paramList[i]) !== Object.nestValue(dependencies.value, paramList[i])) {
            // changed
            apiCall();
            return;
          }
        }
      }
    });

    const localOptions = ref(props.Field.Options || []);

    return {
      fieldData,
      setFieldData,
      localOptions,

      hasError,
      checked,
      dependencies,

      selectOptions,

      readonlyContent,
      checkedIcon,

      selectChanged,
      checkChanged,
      inputControlSettings,

      filterFunc: (val, update) => {
        if (val === '') {
          update(() => {
            localOptions.value = props.Field.Options || [];
          })
          return;
        }

        update(() => {
          const needle = val.toLowerCase();

          localOptions.value = (props.Field.Options || []).filter(opt => {
            return `${opt.Label || opt.Value || opt}`.toLowerCase().indexOf(needle) > -1;
          });
        })
      },

      innerExtraFieldInput: (fld) => {
        selfValidate();
        emit('input', fld);
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.free-field-select {
  .free-field-select-ascheck {
    .field-label {
      line-height: 40px;
    }
  }
}
</style>

<style lang="sass">
.free-field-select
  .q-field__native
    white-space: nowrap
    &>span
      white-space: nowrap
      overflow: hidden
  .checkbox-list
    position: relative
    margin-left: 12px
    &.free-field--error
      padding-right: 24px
</style>
