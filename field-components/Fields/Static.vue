<template>
  <div class="input-field-static">
    <slot name="warning"></slot>
    {{fieldData}}
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldStatic',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Static',
    Label: '固定内容',
    Value: 'Static',
    Description: '',
  },
});
</script>
