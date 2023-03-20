<template>
  <div :class="`input-field-query-filters columns full-width full-height ${dense ? 'dense' : ''}`">
    <div class="row col items-center justify-start full-width">
      <free-field
        v-for="(field, index) in localFields"
        :key="index"
        :Field="field"
        :values="query"
        noExtra
        noWarning
        noTips
        @input="queryChanged = true"
      ></free-field>

      <free-field
        v-if="hasKw && dense"
        :Field="{
          Type: 'String',
          Name: 'kw',
          Placeholder: `请输入 [${(kwFields && kwFields.length) ? kwFields.join('、') : ''}] 关键字进行查询`
        }"
        :values="query"
        @input="queryChanged = true"
        class="keyword"
        @keydown.enter="search"
      ></free-field>

      <q-space v-if="!hasKw || dense"></q-space>
      <div class="q-ma-xs query-btns" v-if="!hasKw || dense">
        <q-btn class="clear-btn" icon="refresh" label="清空" @click="clear"></q-btn>
        <q-btn class="query-btn q-ma-xs" icon="search" label="查询" @click="search"></q-btn>
      </div>
    </div>
    <div class="row col items-center full-width" v-if="hasKw && !dense">
      <free-field
        :Field="{
          Type: 'String',
          Label: '关键字',
          Name: 'kw',
          Placeholder: `请输入 [${(kwFields && kwFields.length) ? kwFields.join('、') : ''}] 进行查询`
         }"
        :values="query"
        @input="queryChanged = true"
        class="keyword"
        @keydown.enter="search"
      ></free-field>
      <q-space></q-space>
      <div class="q-ma-xs query-btns">
        <q-btn
          v-if="canExport"
          class="export-btn"
          icon="fa fa-list"
          label="导出"
          @click="$emit('export')"
        />
        <q-btn class="clear-btn" :icon="clearIcon" label="清空" @click="clear"></q-btn>
        <q-btn class="query-btn q-ma-xs" :icon="searchIcon" label="查询" @click="search"></q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, defineComponent, watchEffect } from 'vue';
import { useFreeField, freeFieldProps } from '../components/useFreeField';

export default defineComponent({
  name: 'InputFieldQueryFilters',
  emits:['search', 'export'],
  fieldInfo: {
    Category: 'Advanced',
    Label: '筛选条件',
    Value: 'QueryFilters',
    Description: '',
  },
  props: {
    ...freeFieldProps,
    dense: { type: Boolean, default: false },
    canExport: { type: Boolean, default: false },
    queryData: { type: Object, default: () => ({}) },
    searchIcon: { type: String, default: 'search' },
    clearIcon: { type: String, default: 'refresh' },
  },
  setup(props, { emit }) {
    if (!props.Field) return {};

    const { fieldData } = useFreeField(props);

    const query = ref({});
    const queryChanged = ref(false);
    const hasKw = ref(false);
    const kwFields = ref([]);

    watchEffect(()  => {
      query.value = props.queryData;
    })

    watchEffect(() => {
      (fieldData.value || []).forEach((fd) => {
        if (
          ['String', 'Text', 'Rich', 'Customize', 'Labels', 'Static'].indexOf(
            fd.Type,
          ) >= 0
        ) {
          if (!fd.Info || !fd.Info.Separate) {
            hasKw.value = true;
            if (fd.Label) {
              kwFields.value.push(fd.Label);
            }
          }
        }
      });
    })

    const localFields = computed(() =>  {
      const fList = [];
      const kwFields = [];
      if (fieldData.value) {
        (fieldData.value || []).forEach((fd) => {
          // TODO: should not hardcode these types
          if (
            ['String', 'Text', 'Rich', 'Customize', 'Labels', 'Static'].indexOf(
              fd.Type,
            ) >= 0
          ) {
            if (!fd.Info || !fd.Info.Separate) {
              if (fd.Label) {
                kwFields.push(fd.Label);
              }
            } else {
            // separate string field as selection
            // TODO: could be other types??
              fd.Type = 'Select';
              if (props.dense) {
                delete fd.Label;
              }
              fList.push(fd);
            }
          } else {
            if (props.dense) {
              delete fd.Label;
            }
            fList.push(fd);
          }
        });
      }

      kwFields.value = kwFields;

      return fList;
    });


    const search = () => {
      if (queryChanged.value) {
        emit('search', query.value);
        queryChanged.value = false;
      }
    };
    const clear = () => {
      if (Object.keys(query.value).length) {
        query.value = {};
        emit('search', {});
        queryChanged.value = false;
      }
    };

    return {
      query,
      queryChanged,
      hasKw,
      kwFields,
      localFields,
      search,
      clear,
    };
  },
});
</script>
