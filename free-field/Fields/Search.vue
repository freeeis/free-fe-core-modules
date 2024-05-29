<template>
  <span class="free-field-search">
    <q-dialog v-model="showSearch" class="free-field-search-dialog" persistent>
      <q-card class="free-field-search-dialog-card">
        <q-toolbar>
          <div class="simple-field full-width">
            <q-input
              autofocus
              v-model="searchKey"
              hide-bottom-space
              :placeholder="Field &&
              ((Field.Options?.SearchPlaceholder) || Field.Placeholder)"
              @keydown.enter="search()"
              class="full-width"
              v-bind="inputControlSettings"
            >
              <template v-slot:append>
                <q-btn :class="Field.Options?.SearchBtnClasses" :flat="!Field.Options?.SearchBtn3D" :round="!Field.Options?.SearchBtnRect" icon="search" @click="search()" :disabled="Field.ReadOnly">{{Field.Options.SearchBtnText}}</q-btn>
              </template>
            </q-input>
          </div>
        </q-toolbar>

        <q-card-section :style="`
          width: ${Field.Options?.Width|| '800px'};
          max-width: ${Field.Options?.MaxWidth|| '80vw'};
          overflow-y: scroll`">
          <q-table
            :flat="Field.Options?.Flat"
            :bordered="Field.Options?.Bordered"
            :rows="searchData.docs || []"
            :columns="searchColumns"
            row-key="id"
            :pagination="searchPagination"
            :selection="Field.Multiple ? 'multiple' : 'single'"
            :selected="searchSelected"
            @update:selected="searchSelected = $event"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width v-if="!Field.Options?.checkOnRight"/>
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
                <q-th auto-width v-if="Field.Options?.checkOnRight"/>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr class="table-row">
                <q-td auto-width v-if="!Field.Options?.checkOnRight">
                   <q-toggle v-model="props.selected" v-if="Field.Options?.useToggle"/>
                   <q-checkbox v-else v-model="props.selected"></q-checkbox>
                </q-td>
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  :class="`col-${col.name} col-${col.value}`"
                >
                {{col.value}}
                </q-td>
                <q-td auto-width v-if="Field.Options?.checkOnRight">
                   <q-toggle v-model="props.selected" v-if="Field.Options?.useToggle"/>
                   <q-checkbox v-else v-model="props.selected"></q-checkbox>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <div class="full-width full-height row flex-center q-gutter-sm">
                <span>暂 无 信 息</span>
              </div>
            </template>

            <template v-slot:bottom>
              <div class="full-width row flex-center">
                共{{searchData.total}}条
                <q-pagination
                  v-model="searchData.page"
                  :max="searchData.pages"
                  @update:modelValue="searchPaginationChanged"
                  boundary-numbers
                  direction-links
                  :max-pages="2"
                ></q-pagination>
              </div>
            </template>
          </q-table>
        </q-card-section>
        <q-card-actions>
          <div class="buttons row full-width justify-center q-ma-sm">
            <q-btn
              :icon="(Field.Options?.CancelIcon) || 'cancel'"
              class="cancel-btn q-mr-md"
              @click="showSearch = false; searchSelected=originalSelected; $emit('input')"
            >{{$t('cancelButtonText')}}</q-btn>
            <q-btn
              :icon="(Field.Options?.OkIcon) || 'check'"
              class="ok-btn" @click="searchOK">{{$t('okButtonText')}}</q-btn>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <span v-if="Field.ReadOnly" class="simple-field row">
      <span
        :class="`field-label field-label-readonly ${
          (Field.Label && Field.Label.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
        v-if="Field.Label !== void 0"
      >
        <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
        {{Field.Label || ''}}
        <span v-if="Field.Required" class="required-mark">*</span>
      </span>
      <span class="readonly-content">
        <span :style="(Field.Info?.Style) ? Field.Info.Style : ''">{{searchDisplay}}</span>
      </span>
    </span>
    <q-input
      v-else
      modelValue=""
      :type="`${Field?.Multiple ? 'textarea' : ''}`"
      hide-bottom-space
      readonly
      :class="`${Field?.Multiple
        ? '' : 'simple-field'} ${searchDisplay ? 'has-data' : 'empty'}`"
      ref="fieldToValid"
      @click="searchKey = '';searchData = {}; showSearch = true"
    >
      <template v-slot:prepend>
        <q-chip
          v-for="(selected, index) in searchSelected"
          :key="index"
          removable
          :value="!!searchSelected[index]"
          @remove="removeSelected(selected)"
          :color="Field.BgColor || 'primary'"
          :text-color="Field.Color || 'white'"
        >
          <q-tooltip
            anchor="top right"
          >{{selected[(Field.Options?.SearchDisplayField) || 'id']}}</q-tooltip>
          {{selected[(Field.Options?.SearchDisplayField) || 'id']}}
        </q-chip>
      </template>
      <template v-slot:before>
        <span
          :class="`field-label ${(Field.Label?.trim().length)
            ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
          v-if="Field.Label !== void 0"
        >
          <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
          {{Field.Label || ''}}
          <span v-if="Field.Required" class="required-mark">*</span>
        </span>
      </template>
      <template v-slot:append>
        <q-btn
          flat
          dense
          icon="search"
          class="search-btn"
          style="width: 36px"
          @click="searchKey = '';searchData = {}; showSearch = true"
        ></q-btn>
      </template>
    </q-input>
    <slot name="warning"></slot>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldSearch',
  emits:['input'],
  props: {
    ...freeFieldProps,
  },
  fieldInfo: {
    Category: 'Advanced',
    Label: '搜索',
    Value: 'Search',
    Extra: [
      {
        Type: 'String',
        Label: '搜索地址',
        Name: 'Options.SearchUrl',
      },
      {
        Type: 'String',
        Label: '搜索字段',
        Name: 'Options.SearchField',
        Default: 'id',
      },
      {
        Type: 'String',
        Label: '搜索传输字段名',
        Name: 'Options.SearchKeyName',
        Default: 'search',
      },
      {
        Type: 'String',
        Label: '显示字段',
        Name: 'Options.SearchDisplayField',
        Default: 'Name',
      },
      {
        Type: 'String',
        Label: '弹窗宽度',
        Name: 'Options.Width',
      },
      {
        Type: 'String',
        Label: '弹窗最大宽度',
        Name: 'Options.MaxWidth',
      },
      {
        Type: 'Boolean',
        Label: '可多选',
        Name: 'Multiple',
        // Extra: [
        //   {
        //     Label: '最多可选',
        //     Type: 'Number',
        //     Name: 'Options.MaxSelection',
        //     Default: 2,
        //     MinValue: 1,
        //   // Options: {
        //   //   Postfix: '个',
        //   // },
        //   },
        //   {
        //     Label: '换行显示',
        //     Type: 'Boolean',
        //     Default: false,
        //     Name: 'Options.AutoWrap',
        //   },
        // ],
      },
      {
        Label: '最多可选',
        Type: 'Number',
        Name: 'Options.MaxSelection',
        Default: 2,
        MinValue: 1,
        // Options: {
        //   Postfix: '个',
        // },
      },
      {
        Label: '换行显示',
        Type: 'Boolean',
        Default: false,
        Name: 'Options.AutoWrap',
      },
      {
        Type: 'String',
        Label: '搜索框占位符',
        Name: 'Options.SearchPlaceholder',
      },
      {
        Type: 'DynamicList',
        Label: '搜索显示列',
        Name: 'Options.SearchColumns',
        Options: {
          Columns: [
            {
              Label: 'Name',
              Name: 'Name',
            },
            {
              Label: 'Label',
              Name: 'Label',
            },
            {
              Label: 'Filters',
              Name: 'filters',
            },
            {
              Label: 'Style',
              Name: 'style',
            },
          ],
        },
      },
    ],
    Description: '',
  },
  setup(props, { expose }) {
    if (!props.Field) return {};

    const { fieldData, setFieldData, inputControlSettings } = useFreeField(props);

    const { validate } = useFormValidator('fieldToValid');
    expose({
      validate,
    })

    return {
      fieldData,
      setFieldData,
      inputControlSettings,
    };
  },
  data() {
    return {
      searchKey: '',
      showSearch: false,
      searchData: {},
      searchSelected: [],
      originalSelected: [],
      searchDisplay: '',
      searchPagination: {
        rowsPerPage:
          this.searchData && this.searchData.limit ? this.searchData.limit : 5,
        rowsNumber:
          this.searchData && this.searchData.total ? this.searchData.total : 0,
      },
    };
  },
  computed: {
    searchColumns() {
      if (!this.Field?.Options?.SearchColumns) {
        return [];
      }

      const cls = [];
      (this.Field?.Options?.SearchColumns || []).forEach((c) => {
        const newC = { ...c };
        newC.name = c.Name;
        newC.label = c.Label;
        newC.field = c.Name;
        newC.required = c.required;
        newC.align = c.align;
        newC.sortable = c.sortable;
        newC.sort = c.sort;
        newC.style = c.style;
        newC.classes = c.classes;
        newC.headerStyle = c.headerStyle;
        newC.headerClasses = c.headerClasses;
        newC.format = c.format || ((val, row) => Object.nestValue(row, c.Name));

        delete newC.Name;
        delete newC.Label;

        cls.push(newC);
      });

      return cls;
    },
  },
  watch: {
    'fieldData.value': function(n, o) {
      // init search data from exist id
      if (this.fieldData.value === void 0) {
        this.searchSelected = [];
        this.searchData = {};
        this.searchDisplay = '';
        this.searchKey = '';
      } else if (this.Field.Type === 'Search' && this.fieldData.value) {
        if (n && o) {
          const nV = Object.nestValue(n, this.Field.Name);
          const oV = Object.nestValue(o, this.Field.Name);

          if (nV === oV || !nV) return;
        }

        if (this.Field.Options && this.Field.Options.SearchUrl) {
          const paramObj = {};
          paramObj[this.Field.Options.SearchField || 'id'] = this.Field.Multiple
            ? JSON.stringify(this.fieldData.value)
            : this.fieldData.value;

          this.getRequest(
              `${this.Field.Options.SearchUrl}`,
              paramObj
            )
            .then((d) => {
              if (d && d.msg === 'OK' && d.data.total) {
                this.searchSelected = d.data.docs;
                const selected = this.Field && this.Field.Multiple
                  ? this.searchSelected : [this.searchSelected[0]];
                const sdFieldName = this.Field.Options.SearchDisplayField || 'id';
                this.searchDisplay = selected.map((ss) => Object.nestValue(ss, sdFieldName))
                  .join(this.Field && this.Field.Options && this.Field.Options.AutoWrap ? '\r\n' : ',');
              }
            });
        }
      }
    },
    searchSelected() {
      if (this.Field && this.Field.Options && this.Field.Options.MaxSelection) {
        if (this.searchSelected.length > this.Field.Options.MaxSelection) {
          this.searchSelected.splice(this.Field.Options.MaxSelection);
        }
      }
    },
    showSearch(v) {
      if (v && this.Field && this.Field.Options && this.Field.Options.AutoSearch) {
        this.search();
      }

      if(v) {
        this.originalSelected = this.searchSelected;
      }
    },
  },
  created() {
    this.searchColumns.forEach((col) => {
      if (col.filters) {
        col.format = (d) => this.$filter(col.filters, d);
      }
    });
  },
  methods: {
    search(p) {
      if (
        !this.Field?.Options?.SearchUrl
        || (!this.searchKey && !this.Field?.Options?.AllowEmptySearch)
      ) {
        return;
      }

      const reqBody = {...(p ? {page: p} : {})};
      reqBody[this.Field.Options?.SearchKeyName || 'search'] = this.searchKey;

      this.getRequest(
          this.Field.Options.SearchUrl,
          reqBody,
        )
        .then((d) => {
          if (d && d.msg === 'OK') {
            const { data } = d;
            if (data) {
              for (let i = 0; i < data.docs?.length; i += 1) {
                const dc = data.docs[i];

                dc.index = (data.page - 1) * data.limit + i + 1;
              }

              this.searchData = data;
            }
          }
        });
    },
    searchPaginationChanged(p) {
      this.search(p);
    },
    searchOK() {
      if (this.searchSelected.length) {
        const selected = this.Field && this.Field.Multiple
          ? this.searchSelected : [this.searchSelected[0]];

        const sFieldName = this.Field.SearchField || 'id';

        this.setFieldData(selected.map(
          (ss) => Object.nestValue(ss, sFieldName),
        ).filter((ss) => !!ss));

        if (!this.Field || !this.Field.Multiple) {
        this.setFieldData(this.fieldData.value[0]);
        }

        const sdFieldName = this.Field.Options.SearchDisplayField || 'id';
        this.searchDisplay = selected.map((ss) => Object.nestValue(ss, sdFieldName))
          .join(this.Field && this.Field.Options && this.Field.Options.AutoWrap ? '\r\n' : ',');

        this.showSearch = false;
        this.$emit('input');
      }
    },
    removeSelected(item) {
      if (!item) return;

      if (!this.Field || !this.Field.Multiple) {
        this.searchSelected = [];
        this.setFieldData(undefined);

        this.$emit('input');

        return;
      }

      const index = this.searchSelected.findIndex((ss) => ss[this.Field.SearchField || 'id'] === item[this.Field.SearchField || 'id']);
      if (index >= 0) {
        this.searchSelected.splice(index, 1);

        const selected = this.Field && this.Field.Multiple
          ? this.searchSelected : [this.searchSelected[0]];
        const sFieldName = this.Field.SearchField || 'id';
        this.fieldData = selected.map(
          (ss) => Object.nestValue(ss, sFieldName),
        ).filter((ss) => !!ss);

        const sdFieldName = this.Field.Options.SearchDisplayField || 'id';
        this.searchDisplay = selected.map((ss) => Object.nestValue(ss, sdFieldName))
          .join(this.Field && this.Field.Options && this.Field.Options.AutoWrap ? '\r\n' : ',');

        this.$emit('input');
      }
    },
  },
});
</script>

<style lang="sass" scoped>
.free-field-search-dialog-card
  max-width: unset !important
  max-height: unset !important

.free-field-search
  .simple-field
    display: flex
</style>
