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
import { defineComponent, getCurrentInstance, watch, ref, computed } from 'vue';
import { useFreeField, freeFieldProps } from 'free-fe-core-modules/free-field/composible/useFreeField';
import { useFormValidator} from 'free-fe-core-modules/composible/useFormValidator';

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
  setup(props, { emit, expose }) {
    if (!props.Field) return {};

    const { proxy:vm } = getCurrentInstance();

    const { fieldData, setFieldData, inputControlSettings } = useFreeField(props);

    const { validate } = useFormValidator('fieldToValid');

    expose({
      validate,
    })

    const searchKey = ref('');
    const showSearch = ref(false);
    const searchData = ref({});
    const searchSelected = ref([]);
    const originalSelected = ref([]);
    const searchDisplay = ref('');
    const searchPagination = {
      rowsPerPage: searchData.value?.limit ? searchData.value.limit : 5,
      rowsNumber: searchData.value?.total ? searchData.value.total : 0,
    };

    const valueUpdated = (n, o) => {
      // init search data from exist id
      if (fieldData.value === void 0) {
        searchSelected.value = [];
        searchData.value = {};
        searchDisplay.value = '';
        searchKey.value = '';
      } else if (props.Field.Type === 'Search' && fieldData.value) {
        if (n && o) {
          const nV = Object.nestValue(n, props.Field.Name);
          const oV = Object.nestValue(o, props.Field.Name);

          if (nV === oV || !nV) return;
        }

        if (props.Field.Options && props.Field.Options.SearchUrl) {
          const paramObj = {};
          paramObj[props.Field.Options.SearchField || 'id'] = props.Field.Multiple
            ? JSON.stringify(fieldData.value)
            : fieldData.value;

          vm.getRequest(
              `${props.Field.Options.SearchUrl}`,
              paramObj
            )
            .then((d) => {
              if (d && d.msg === 'OK' && d.data.total) {
                searchSelected.value = d.data.docs;
                const selected = props.Field?.Multiple
                  ? searchSelected.value : [searchSelected.value[0]];
                const sdFieldName = props.Field.Options.SearchDisplayField || 'id';
                searchDisplay.value = selected.map((ss) => Object.nestValue(ss, sdFieldName))
                  .join(props.Field?.Options?.AutoWrap ? '\r\n' : ',');
              }
            });
        }
      }
    };

    watch(fieldData, valueUpdated);
    valueUpdated(fieldData.value, void 0);

    watch(searchSelected, () => {
      if (props.Field?.Options?.MaxSelection) {
        if (searchSelected.value.length > props.Field.Options.MaxSelection) {
          searchSelected.value.splice(props.Field.Options.MaxSelection);
        }
      }
    });

    watch(showSearch, (v) => {
      if (v && props.Field?.Options?.AutoSearch) {
        search();
      }

      if(v) {
        originalSelected.value = searchSelected.value;
      }
    });

    const search = (p) => {
      if (
        !props.Field?.Options?.SearchUrl
        || (!searchKey.value && !props.Field?.Options?.AllowEmptySearch)
      ) {
        return;
      }

      const reqBody = {...(p ? {page: p} : {})};
      reqBody[props.Field.Options?.SearchKeyName || 'search'] = searchKey.value;

      vm.getRequest(
        props.Field.Options.SearchUrl,
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

            searchData.value = data;
          }
        }
      });
    };

    return {
      fieldData,
      setFieldData,
      inputControlSettings,
      searchKey,
      showSearch,
      searchData,
      searchSelected,
      originalSelected,
      searchDisplay,
      searchPagination,
      searchColumns: computed(() => {
        if (!props.Field?.Options?.SearchColumns) {
          return [];
        }

        const cls = [];
        (props.Field?.Options?.SearchColumns || []).forEach((c) => {
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

          if (c.filters) {
            newC.format = (d) => vm.$filter(c.filters, d);
          }

          delete newC.Name;
          delete newC.Label;

          cls.push(newC);
        });

        return cls;
      }),
      search,
      searchPaginationChanged: (p) => {
        search(p);
      },
      searchOK: () => {
        if (searchSelected.value.length) {
          const selected = props.Field?.Multiple
            ? searchSelected.value : [searchSelected.value[0]];

          const sFieldName = props.Field.SearchField || 'id';

          setFieldData(selected.map(
            (ss) => Object.nestValue(ss, sFieldName),
          ).filter((ss) => !!ss));

          if (!props.Field?.Multiple) {
          setFieldData(fieldData.value[0]);
          }

          const sdFieldName = props.Field?.Options?.SearchDisplayField || 'id';
          searchDisplay.value = selected.map((ss) => Object.nestValue(ss, sdFieldName))
            .join(props.Field?.Options?.AutoWrap ? '\r\n' : ',');

          showSearch.value = false;
          emit('input');
        }
      },
      removeSelected: (item) => {
        if (!item) return;

        if (!props.Field?.Multiple) {
          searchSelected.value = [];
          setFieldData('');

          emit('input');

          return;
        }

        const index = searchSelected.value.findIndex((ss) => ss[props.Field?.SearchField || 'id'] === item[props.Field?.SearchField || 'id']);
        if (index >= 0) {
          searchSelected.value.splice(index, 1);

          const selected = props.Field?.Multiple
            ? searchSelected.value : [searchSelected.value[0]];
          const sFieldName = props.Field?.SearchField || 'id';
          fieldData.value = selected.map(
            (ss) => Object.nestValue(ss, sFieldName),
          ).filter((ss) => !!ss);

          const sdFieldName = props.Field?.Options?.SearchDisplayField || 'id';
          searchDisplay.value = selected.map((ss) => Object.nestValue(ss, sdFieldName))
            .join(props.Field?.Options?.AutoWrap ? '\r\n' : ',');

          emit('input');
        }
      },
    };
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
