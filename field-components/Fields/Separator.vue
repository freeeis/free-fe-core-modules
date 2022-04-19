<template>
   <q-separator :inset="inset" class="input-field-separator"/>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'InputFieldSeparator',
  props: {
    inset: { type: Boolean, default: true },
  },
  fieldInfo: {
    Category: 'Static',
    Label: '分割线',
    Value: 'Separator',
    Description: '',
  },
});
</script>

<style lang="sass" scoped>
.input-field-separator
  height: 1px
  background: $grey-4
</style>
