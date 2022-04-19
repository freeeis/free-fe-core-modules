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
        v-model="fieldData"
        :options="Field.Options || []"
        option-value="Value"
        option-label="Label"
        map-options
        :label="Field.Placeholder"
        emit-value
        v-bind="$attrs"
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
        </template>

        <template v-slot:option="scope">
          {{scope.itemProps}}
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
              <q-item-label v-html="scope.opt.Label" />
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
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldSelect',
  mixins: [mixins.InputFieldMixin],
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
  data() {
    return {
      checked: [],
      dependencies: {},
    };
  },
  computed: {
    readonlyContent() {
      if (this.Field && this.Field.Options && Array.isArray(this.Field.Options)) {
        let valueList;
        if (this.Field.Multiple) {
          if (Array.isArray(this.fieldData)) {
            valueList = this.fieldData;
          } else if (typeof this.fieldData === 'string') {
            valueList = this.fieldData.split(',');
          }
        } else {
          valueList = [this.fieldData];
        }

        const labelList = [];
        (valueList || []).forEach((vl) => {
          const theOpt = this.Field.Options.find((opt) => opt.Value === vl);
          if (theOpt) labelList.push(theOpt.Label || this.fieldData);
        });

        return labelList.join(',');
      }

      return this.fieldData;
    },
  },
  watch: {
    fieldData() {
      if (this.Field.AsCheck) {
        if (this.fieldData) {
          this.checked = this.fieldData.toString().split(',');
        } else {
          this.checked = [];
        }
      }
      this.$emit('update:fieldData');
    },
    data: {
      handler() {
        if (!this.Field || !this.Field.Info || !this.Field.Info.Url || !this.data) return;

        this.Field.Info.Params = this.Field.Info.Params || '';
        if (this.Field.Info.Params) {
          const paramList = typeof this.Field.Info.Params === 'string' ? this.Field.Info.Params.split(',') : this.Field.Info.Params;

          for (let i = 0; i < paramList.length; i += 1) {
            if (Object.nestValue(this.data, paramList[i])
              !== Object.nestValue(this.dependencies, paramList[i])) {
              // changed
              this.apiCall();
              return;
            }
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    selfValidate() {
      if (this.Field && this.Field.AsCheck && this.Field.Required) {
        const isValid = this.checked && this.checked.length > 0;
        this.hasError = !isValid;
        return isValid;
      }

      return true;
    },
    checkChanged(v) {
      this.selfValidate();

      if (!this.Field.Multiple) {
        this.checked = [v];
      }
      this.fieldData = this.checked.join(',');
      this.$emit('input');
    },
    apiCall() {
      if (!this.Field.Info || !this.Field.Info.Url) {
        return;
      }

      const paramObj = {};
      this.Field.Info.Params = this.Field.Info.Params || '';
      if (this.Field.Info.Params.length > 0) {
        if (typeof this.Field.Info.Params === 'string') {
          this.Field.Info.Params = this.Field.Info.Params.split(',');
        }
        for (let i = 0; i < this.Field.Info.Params.length; i += 1) {
          const param = this.Field.Info.Params[i];

          if (param) {
            Object.setValue(paramObj, param, Object.nestValue(this.data, param));
            Object.setValue(this.dependencies, param, Object.nestValue(this.data, param));
          }
        }
      }

      this.postRequest(this.Field.Info.Url, paramObj).then((d) => {
        if (d && d.msg === 'OK') {
          if (d.data && d.data.options) {
            this.Field.Options = d.data.options;
            if (d.data.options.findIndex((o) => o.Value === this.fieldData) < 0) {
              this.fieldData = undefined;
            }
          } else {
            this.Field.Options = [];
          }
        }
      });
    },
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
