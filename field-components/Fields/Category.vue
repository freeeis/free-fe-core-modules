<template>
  <div
    v-if="typeof Field.Label !== 'undefined'"
    v-bind="$attrs"
    class="input-field-category simple-field row items-center no-wrap">
    <span class="label">{{Field.Label}}</span>
    <slot name="warning"></slot>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldCategory',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Static',
    Label: '字段分类',
    Value: 'Category',
    Description: '',
  },
});
</script>

<style lang="sass" scoped>
.field-category
    font-size: 14px
    font-weight: bold
    margin-top: 12px
    margin-bottom: 12px
</style>
