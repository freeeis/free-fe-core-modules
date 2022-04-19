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
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldQueryFilters',
  mixins: [mixins.InputFieldMixin],
  emits:['search', 'export'],
  fieldInfo: {
    Category: 'Advanced',
    Label: '筛选条件',
    Value: 'QueryFilters',
    Description: '',
  },
  props: {
    dense: { type: Boolean, default: false },
    canExport: { type: Boolean, default: false },
    queryData: { type: Object, default: () => ({}) },
    searchIcon: { type: String, default: 'search' },
    clearIcon: { type: String, default: 'refresh' },
  },
  data() {
    return {
      query: {},
      queryChanged: false,
      hasKw: false,
      kwFields: [],
    };
  },
  computed: {
    localFields() {
      const fList = [];
      let hasKw = false;
      const kwFields = [];
      if (this.fieldData) {
        this.fieldData.forEach((fd) => {
          if (
            ['String', 'Text', 'Rich', 'Customize', 'Labels', 'Static'].indexOf(
              fd.Type,
            ) >= 0
          ) {
            if (!fd.Info || !fd.Info.Separate) {
              hasKw = true;
              if (fd.Label) {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                kwFields.push(fd.Label);
              }
            } else {
            // separate string field as selection
            // TODO: could be other types??
              fd.Type = 'Select';
              if (this.dense) {
                delete fd.Label;
              }
              fList.push(fd);
            }
          } else {
            if (this.dense) {
              delete fd.Label;
            }
            fList.push(fd);
          }
        });
      }

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.hasKw = hasKw;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.kwFields = kwFields;

      return fList;
    },
  },
  watch: {
    queryData() {
      this.query = this.queryData;
    },
  },
  created() {
    if (this.queryData && Object.keys(this.queryData).length > 0) {
      this.query = this.queryData;
    }
  },
  methods: {
    search() {
      if (this.queryChanged) {
        this.$emit('search', this.query);
        this.queryChanged = false;
      }
    },
    clear() {
      if (Object.keys(this.query).length) {
        this.query = {};
        this.$emit('search', {});
        this.queryChanged = false;
      }
    },
  },
});
</script>
