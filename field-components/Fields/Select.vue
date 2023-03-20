<template>
  <span :class="(Field && Field.AsCheck) ? 'input-field-select' :
    'input-field-select simple-field row'">
    <span
      v-if="!Field.AsCheck"
      class="row no-wrap items-center full-width inline-block"
    >
      <span
        v-if="Field.ReadOnly"
        class="full-width"
      >
        <span
          :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
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
        <span class="readonly-content">
          <span
            class="prefix"
            v-if="Field.Options && Field.Options.Prefix"
          >
            {{Field.Options.Prefix}}
          </span>
          <span :style="(Field.Info && Field.Info.Style) ? Field.Info.Style : ''">
            {{readonlyContent}}
          </span>
          <span
            class="postfix"
            v-if="Field.Options && Field.Options.Postfix"
          >{{Field.Options.Postfix}}</span>
        </span>
      </span>

      <q-select
        v-else
        popup-content-class="input-field-select-control"
        hide-bottom-space
        :modelValue="fieldData.value"
        @update:modelValue="setFieldData"
        :options="Field.Options || []"
        option-value="Value"
        option-label="Label"
        map-options
        :label="Field.Placeholder"
        emit-value
        :multiple="Field.Multiple"
        :readonly="Field.ReadOnly"
        :ref="`input_field_validator_${Field.Name || Field.Label}`"
        :use-input="Field && Field.UseInput"
        :use-chip="Field && Field.UseChip"
      >
        <template v-slot:before>
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
        </template>

        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
          >
            <q-item-section
              avatar
              v-if="scope.opt.Icon"
            >
              <e-icon :name="scope.opt.Icon" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ scope.opt.Label }}</q-item-label>
              <q-tooltip v-if="scope.opt.Tooltip">
                {{scope.opt.Tooltip}}
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
    <span
      v-else
      class="input-field-select-ascheck row items-start no-wrap"
    >
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
      <span class="column items-start no-wrap">
        <div>
          <slot name="warning"></slot>
        </div>
        <div
          class="checkbox-list"
          :class="hasError ? 'input-field--error' : ''"
        >

          <div
            class="input-field--error-tag"
            v-if="hasError"
          >
            <e-icon name="error"></e-icon>
          </div>

          <q-checkbox
            v-for="(option, index) in Field.Options"
            :key="index"
            hide-bottom-space
            :label="option.Label || ''"
            v-model="checked"
            :val="option.Value"
            :disable="Field.ReadOnly"
            @input="checkChanged(option.Value)"
          ></q-checkbox>
        </div>
      </span>
    </span>
  </span>
</template>

<script>
import { ref, computed, defineComponent, getCurrentInstance, watch, watchEffect } from 'vue';
import { useFreeField, freeFieldProps } from '../components/useFreeField';

export default defineComponent({
  name: 'InputFieldSelect',
  props: {
    ...freeFieldProps,
  },
  emits:['udpate:fieldData', 'input'],
  fieldInfo: {
    Category: 'Simple',
    Label: '选择',
    Value: 'Select',
    Description: '',
    Extra: [
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
          ],
        },
      },
    ],
  },
  setup(props, { emit, expose }) {
    if (!props.Field) return () => null;

    const { proxy:vm } = getCurrentInstance();

    const { fieldData, getFieldData, setFieldData } = useFreeField(props);

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
        });

        return labelList.join(',');
      }

      return fieldData.value;
    });


    watch(fieldData, () => {
      if (props.Field.AsCheck) {
        if (fieldData.value) {
          checked.value = `${fieldData.value}`.split(',');
        } else {
          checked.value = [];
        }
      }
    });

    const selfValidate = () => {
      if (props.Field.AsCheck && props.Field.Required) {
        const isValid = checked.value && checked.value.length > 0;
        hasError.value = !isValid;
        return isValid;
      }

      return true;
    };

    expose ({
      selfValidate,
    })

    const checkChanged = (v) => {
      selfValidate();

      if (!props.Field.Multiple) {
        checked.value = [v];
      }
      setFieldData(checked.value.join(','));
      emit('input');
    };

    const apiCall = () => {
      if (!props.Field.Info?.Url) {
        return;
      }

      const paramObj = {};
      const params = props.Field.Info.Params || '';
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
              setFieldData(undefined);
              emit('input');
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

    return {
      fieldData,
      setFieldData,

      hasError,
      checked,
      dependencies,

      selectOptions,

      readonlyContent,

      checkChanged,
    };
  },
});
</script>

<style lang="sass">
.input-field-select
  .q-field__native
    white-space: nowrap
    &>span
      white-space: nowrap
      overflow: hidden
  .checkbox-list
    position: relative
    margin-left: 12px
    &.input-field--error
      padding-right: 24px
</style>
