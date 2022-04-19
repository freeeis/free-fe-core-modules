<template>
  <span
    class="simple-field input-field-string row items-center no-wrap"
    v-if="Field"
  >
    <span
      v-if="Field.ReadOnly"
      class="full-width"
    >
      <span
        :class="`field-label field-label-readonly ${(Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="Field.Label !== void 0">
        <q-tooltip
          v-if="Field.Description"
          anchor="top right"
        >{{Field.Description}}</q-tooltip>{{Field.Label || ''}}
        <span
          v-if="Field.Required"
          class="required-mark"
        >*</span>
      </span>
      <span class="readonly-content">
        <span
          class="prefix"
          v-if="Field.Options && Field.Options.Prefix"
        >{{Field.Options.Prefix}}
        </span>
        <span :style="(Field.Info && Field.Info.Style) ? Field.Info.Style : ''">{{modelValue}}
        </span>
        <span
          class="postfix"
          v-if="Field.Options && Field.Options.Postfix"
        >{{Field.Options.Postfix}}</span>
      </span>
    </span>
    <q-input
      v-else
      v-model="localData"
      @update:model-value="inputEvent"
      autocomplete="off"
      v-bind="$attrs"
      hide-bottom-space
      :readonly="Field.ReadOnly"
      :ref="`input_field_validator_${Field.Name || Field.Label}`"
      :maxlength="maxlength"
      :style="(Field.Info && Field.Info.Style) ? Field.Info.Style : ''"
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

      <template
        v-slot:prepend
        v-if="Field && ((Field.Slots && Field.Slots.indexOf('prepend') >= 0)
        || (Field.Options && Field.Options.Prefix))"
      >
        <slot name="prepend"
          v-if="Field && Field.Slots && Field.Slots.indexOf('prepend') >= 0"></slot>
        <span
          class="prefix"
          v-if="Field && Field.Options && Field.Options.Prefix"
        >{{Field.Options.Prefix}}</span>
      </template>

      <template
        v-slot:append
        v-if="Field && ((Field.Slots && Field.Slots.indexOf('append') >= 0)
        || (Field.Options && Field.Options.Postfix))"
      >
        <slot v-if="Field && Field.Slots && Field.Slots.indexOf('append') >= 0"
          name="append"></slot>
        <span
          class="postfix"
          v-if="Field && Field.Options && Field.Options.Postfix"
        >{{Field.Options.Postfix}}</span>
      </template>
    </q-input>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldString',
  emits: ['update:modelValue'],
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Simple',
    Label: '字符串',
    Value: 'String',
    Extra: [
      {
        Type: 'String',
        Label: '前缀',
        Name: 'Options.Prefix',
      },
      {
        Type: 'String',
        Label: '后缀',
        Name: 'Options.Postfix',
      },
      {
        Type: 'String',
        Label: '最小值',
        Name: 'MinValue',
      },
      {
        Type: 'String',
        Label: '最大值',
        Name: 'MaxValue',
      },
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
      },
      {
        Type: 'Labels',
        Label: '类型检查',
        Name: 'rules',
      },
    ],
    Description: '',
  },
  props: {
    // modelValue: {},
    // Field: Object
  },
  setup(props, { emit }){
    let localData = ref(props.fieldData || '');

    watch(() => props.fieldData, (v) => {
      localData.value = v.value;
    })

    const maxlength = computed(() => {
      if (props.Field && props.Field.Options
        && props.Field.Options.MaxLength) {
        return props.Field.Options.MaxLength;
      }
      return '';
    });

    watch(localData, () => {
      let v = localData.value;
      if (typeof props.Field.MinValue !== 'undefined' && props.Field.MinValue > v) {
        v = props.Field.MinValue;
      }
      if (typeof props.Field.MaxValue !== 'undefined' && props.Field.MaxValue < v) {
        v = props.Field.MaxValue;
      }

      localData.value = v;
    })

    const inputEvent = (e) => {
      emit('update:modelValue', e);
    }

    return {
      localData,
      maxlength,
      inputEvent
    }
  },
});
</script>
