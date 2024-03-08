<template>
  <div class="summary-head-wrapper">
    <div
      v-for="(item, i) in data"
      :key="i"
      :class="
        (item.is_count ? 'summary-head-count ' : '') +
          (item.is_title
            ? 'summary-head-title summary-head-item'
            : 'summary-head-item') +
            ((i < data.length && data[i + 1] && data[i + 1].button) ? ' last-summary' : '')
      "
      :style="'width: 20%;'"
    >
      <e-icon
        v-if="item.icon && !item.button"
        :relative="item.relative"
        class="summary-head-icon"
        :name="item.icon"
      />
      <div>
        <div v-if="item.is_title" class="title">{{ item.title }}</div>
        <div
          v-if="item.is_title"
          :class="'fund' + (has_multiple_head ? ' ' : ' single-fund')"
        >
          {{ item.fund }}
          <span
            v-if="has_multiple_head"
            class="fund-selection-icon el-icon-caret-bottom"
          ></span>
        </div>
        <q-btn
          flat
          round
          :disable="item.disable"
          class="summary-head-btn"
          v-if="item.button"
          @click="button_clicked(item)">

          <e-icon
            v-if="item.icon && item.button"
            class="summary-head-btn-icon"
            :relative="item.relative"
            :name="item.icon"
          />
          <span class="text">{{ item.text }}</span>
        </q-btn>
        <span
          v-if="item.number !== void 0"
          :class="
            item.number && Number(item.number).toString() !== 'NaN'
              ? 'summary-head-number is-number highlight'
              : 'summary-head-number'
          "
          :style="
            item.action || item.event || item.route ? 'cursor: pointer;' : ''
          "
          @click="button_clicked(item)"
          >{{ filteredValue(item) }}
          <span v-if="item.warning" style="display: none;" class="warning">{{
            item.warning
          }}</span>
          <span
            v-if="item.unit && item.number && Number(item.number).toString() !== 'NaN'"
            class="unit"
            >{{ item.unit }}</span
          >
        </span>
        <div v-if="item.text && !item.button" class="summary-head-label">
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router'
import { useObjectData, objectDataProps } from '../../composible/useObjectData';

export default defineComponent({
  name: 'SummaryHead',
  props: {
    ...objectDataProps,
    has_multiple_head: { type: Boolean, default: false },
    values: {type: Object, default: () => ({})},
  },
  setup(props, ctx) {
    const {
      data,
      refreshData,
    } = useObjectData(props, ctx);
    const router = useRouter();

    return {
      data,
      refreshData,
      router,
    };
  },
  created() {
    if (this.values) {
      this.data = this.values;
    }
  },
  watch: {
    values(v) {
      this.data = v || [];
    },
  },
  methods: {
    filteredValue(item) {
      // use filter to the summary value
      if (item && item.filters) {
        let filters = [];
        if (Array.isArray(item.filters)) {
          filters = filters.concat(item.filters);
        } else if (typeof item.filters === 'string') {
          filters.push(item.filters);
        }

        for (let j = 0; j < filters.length; j += 1) {
          const f = filters[j];

          item.number = this.$filter(f, item.number);
        }

        // remove the filter to avoid filter multiple times
        delete item.filters;
      }

      return item.number;
    },
    button_clicked(item) {
      if (item.disable) return;

      item.disable = true;
      Promise.resolve(typeof item.action === 'function' ? item.action(item) : '').then(() => {
        item.disable = false;
        if (item.event) {
          if (item.event_params) {
            this.Bus?.$emit(item.event, item.event_params);
          } else {
            this.Bus?.$emit(item.event);
          }
        }

        if (item.route) {
          // const rParams = { name: item.route };

          // if (item.route_query) rParams.query = item.route_query;
          // if (item.route_params) rParams.params = item.route_params;

          this.router.push(item.route);
        }
      }).catch(() => {
        item.disable = false;
      });
    },
  },
  beforeUnmount() {
  },
});
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.summary-head-wrapper {
  display: inline-flex;
  align-items: flex-start;
  /*justify-content: center;*/
  height: 118px;
  width: 100%;
  // background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  // border: 1px solid rgba(208, 208, 208, 1);

  .summary-head-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-width: 120px;
    text-align: center;
    /*margin: 0 auto;*/
    /*margin-left: 37px;*/
    /*margin-right: 5px;*/

    .title {
      margin: 8px;
      height: 24px;
      max-width: 90%;
      font-size: 18px;
      font-weight: bold;
      // color: rgba(113, 152, 200, 1);
      line-height: 24px;
      -webkit-background-clip: text;
      background-clip: text;
      text-align: center;
      overflow: hidden;
      /*white-space: nowrap;*/
      text-overflow: ellipsis;
    }

    .fund {
      position: relative;
      height: 34px;
      min-width: 140px;
      margin: 0 2px;
      // background: rgba(255, 255, 255, 1);
      border-radius: 18px;
      // border: 1px solid rgba(151, 151, 151, 1);

      font-size: 12px;
      color: rgba(74, 74, 74, 1);
      line-height: 34px;
      text-align: center;
      overflow: hidden;
      /*white-space: nowrap;*/
      text-overflow: ellipsis;

      .fund-selection-icon {
        display: inline;
        position: absolute;
        top: 10px;
        right: 5px;
      }
    }

    .single-fund {
      border-width: 0;
    }

    .summary-head-icon {
      display: inline-block;
      // height: 36px;
      // width: 36px;
      margin: 0 5px;
    }

    .summary-head-number {
      height: 34px;
      /*font-size:28px;*/
      font-size: 2.2vw;
      font-weight: normal;
      line-height: 34px;
      text-align: center;

      .warning {
        font-size: 12px;
        color: rgba(199, 199, 199, 1);
        line-height: 16px;
      }

      .unit {
        height: 16px;
        font-size: 12px;
        line-height: 16px;
      }
    }

    .summary-head-label {
      height: 16px;
      font-size: 12px;
      // color: rgba(155, 155, 155, 1);
      line-height: 16px;
      text-align: center;
    }

    .summary-head-btn {
      cursor: pointer;

      .summary-head-btn-icon {
        display: block;
        width: 52px;
        height: 52px;
        margin: 7px auto;
      }

      .text {
        // font-size: 12px;
        // color: rgba(0, 138, 183, 1);
        line-height: 16px;
        text-align: center;
        margin: 0 auto;
      }
    }
  }

  .summary-head-title:after,
  .summary-head-count:after {
    position: absolute;
    content: '';
    display: inline-block;
    width: 1px;
    height: 80px;
    // background: rgba(216, 216, 216, 1);
    border-radius: 2px;
    left: 16.67%;
  }
}

@media screen and (min-width: 1240px) {
  .summary-head-wrapper {
    .summary-head-item {
      .summary-head-number {
        font-size: 28px;
      }
    }
  }
}

@media screen and (max-width: 1080px) {
  .summary-head-wrapper {
    .summary-head-item {
      .summary-head-number {
        font-size: 22px;
      }
    }
  }
}

.summary-head-wrapper {
  .summary-head-count {
    .summary-head-number {
      font-size: 40px;
      font-weight: normal;
      color: rgba(245, 166, 35, 1);
      line-height: 49px;
    }
  }
}
</style>
