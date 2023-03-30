<template>
  <div class="flow-list">
    <summary-head :values="data.summary"></summary-head>
    <q-table
      flat
      bordered
      :rows="data ? data.docs : []"
      :columns="columns"
      row-key="id"
      :hide-bottom="!pagination"
      :pagination="tablePagination"
    >
      <template v-slot:header-cell-status="props" v-if="data.Filters && data.Filters.length > 0">
        <q-th :props="props" class="filter-header-cell">
          <q-btn flat icon="search" @click="showFilters = !showFilters">查询</q-btn>
        </q-th>
      </template>

      <template v-slot:body="props">
        <q-tr>
          <q-td v-for="col in props.cols" :key="col.name" :props="props" class="ellipsis">
            <span v-if="col.name === 'index'">{{props.row.index}}</span>
            <span v-else>
              {{ valueFilters(col, col.value || Object.nestValue(props.row, col.field))}}
              <q-popup-edit
                v-slot="scope"
                v-model="props.row.Message"
                v-if="col.name === 'message'"
                label-set="保存"
                label-cancel="取消"
              >
                <q-input v-model="props.row.Message" hide-bottom-space autofocus
                  @keyup.enter="messageChanged(props.row.id, props.row.Message, scope)"/>
              </q-popup-edit>
              <q-popup-edit
                v-slot="scope"
                :model-value="props.row.Description"
                v-if="col.name === 'description'"
                :label-set="$t('保存')"
                :label-cancel="$t('取消')"
              >
                <q-input v-model="props.row.Description" hide-bottom-space autofocus 
                  @keyup.enter="descriptionChanged(props.row.id, props.row.Description, scope)"/>
              </q-popup-edit>
            </span>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:top-row>
        <!-- <q-tr class="persistant-top-row full-width">
          <q-td class="full-width" colspan="100%"></q-td>
        </q-tr> -->
        <q-tr v-if="showFilters" class="table-row filter-row">
          <q-td colspan="100%" class="table-cell filter-cell">
            <free-field
              :Field="{Type: 'QueryFilters', Name: 'Filters'}"
              :values="data"
              @search="querySearch"
            ></free-field>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="full-width full-height row flex-center q-gutter-sm">
          <span>{{$t('暂无数据')}}</span>
        </div>
      </template>

      <template v-slot:bottom>
        <div v-if="pagination" class="full-width row flex-center">
          共{{data.total}}条
          <q-pagination
            v-model="data.page"
            :max="data.pages"
            @input="paginationChanged"
            boundary-links
            boundary-numbers
            direction-links
            :max-pages="6"
          ></q-pagination>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useObjectData, objectDataProps } from '../../composible/useObjectData';
import { updateErrorCode, updateDescription } from '../../router/error/api';

export default defineComponent({
  name: 'ErrorCodeList',
  props: {
    ...objectDataProps,
    pagination: { type: Boolean, default: true },
  },
  setup(props, ctx) {
    const {
      data,
      refreshData,
    } = useObjectData(props, ctx);

    return {
      data,
      refreshData,
    };
  },
  data() {
    return {
      queryFilter: {},
      showFilters: false,
      tablePagination: {
        rowsPerPage: this.data && this.data.limit ? this.data.limit : 8,
        rowsNumber: this.data && this.data.total ? this.data.total : 0,
      },
      columns: [
        {
          name: 'index',
          label: '#',
          field: 'index',
        },
        {
          name: 'date',
          label: this.$t('日期'),
          field: 'LastUpdateDate',
          filters: 'normalDate',
          style: 'max-width: 200px;',
        },
        {
          name: 'code',
          label: this.$t('代码'),
          field: 'Code',
          style: 'max-width: 120px;',
        },
        {
          name: 'message',
          label: this.$t('信息'),
          field: 'Message',
        },
        {
          name: 'description',
          label: this.$t('描述'),
          field: 'Description',
        },
      ],
    };
  },
  computed: {
    valueFilters() {
      return (col, v) => {
        let val = v || col.value;
        if (col.filters) {
          let filters = [];
          if (typeof col.filters === 'string') {
            // only one filter
            filters.push(col.filters);
          } else if (Array.isArray(col.filters)) {
            filters = filters.concat(col.filters);
          }

          for (let i = 0; i < filters.length; i += 1) {
            const f = filters[i];
            val = this.$filter(f, v || col.value)
          }
        }

        return val;
      };
    },
  },
  created() {},
  methods: {
    paginationChanged(p) {
      this.refreshData({ page: p });
    },
    messageChanged(id, msg, popup) {
      popup.set();
      updateErrorCode(id, msg).then((d) => {
        if (d && d.msg === 'OK') {
          this.$q.notify(this.$t('notifySaved'));
        } else {
          this.$q.notify(this.$t('notifyChangeFailed'));
        }
      });
    },
    descriptionChanged(id, desc, popup) {
      popup.set();
      updateDescription(id, desc).then((d) => {
        if (d && d.msg === 'OK') {
          this.$q.notify(this.$t('notifySaved'));
        } else {
          this.$q.notify(this.$t('notifyChangeFailed'));
        }
      });
    },
  },
  beforeUnmount() {},
});
</script>
