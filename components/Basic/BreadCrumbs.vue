<template>
  <q-breadcrumbs separator=" &gt; " class="breadcrumbs">
    <q-breadcrumbs-el
      v-for="(item, index) in meta"
      :key="index"
      @click="Bread(index)"
      :label="item.title || item"
      :class="{'cursor-pointer':!!item.route}"
    />
    <q-space></q-space>
    <q-btn v-if="meta.length > 0 && canBack"
      flat :icon="backIcon" @click="back">{{$t(backText)}}</q-btn>
  </q-breadcrumbs>
</template>

<script>
import { defineComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { mapWritableState } from 'pinia';
import useAppStore from '@/stores/app';

export default defineComponent({
  name: 'BreadCrumbs',
  props: {
    canBack: { type: Boolean, default: true },
    backText: { type: String, default: '返回' },
    backIcon: { type: String, default: 'keyboard_arrow_left' },
  },
  setup() {
    const router = useRouter();

    return {
      router,
      route: useRoute(),
    };
  },
  data() {
    return {
      nextFlag: false,
      whiteList: [],
      crumbNames: [],
    };
  },
  computed: {
    ...mapWritableState(useAppStore, ['crumbs']),
    meta() {
      let mt = [];
      if (this.crumbs && this.crumbs.length) {
        mt = this.crumbs;
      } else if (this.route.meta && this.route.meta.length) {
        mt = this.route.meta;
      } else {
        for (let i = 0; i < this.route.matched.length; i += 1) {
          const rm = this.route.matched[i];
          if (rm.meta && rm.meta.length) mt = rm.meta;
        }
      }

      return mt.map(m => {
        if(typeof m === 'string') return this.$t(m);

        return {
          ...m,
          ...(m.title ? {title: this.$t(m.title)} : {}),
        };
        }) || [];
    },
  },
  created() {
    this.crumbs = undefined;
  },
  methods: {
    Bread(index) {
      if (index === this.meta.length - 1 || index < 0 || !this.meta[index].route) {
        return;
      }

      this.router.push(this.meta[index].route);
      // const backIndex = this.meta.length - 1 - index;
      // window.history.go(-backIndex);
    },
    back() {
      const URL = this.route.fullPath.indexOf('?') === -1
        ? this.route.fullPath
        : this.route.fullPath.split('?')[0];
      if (this.whiteList.indexOf(URL) === -1) {
        window.history.go(-1);
      } else {
        // this.$store.state.watchData.refreshFlag = true;
        window.history.go(-1);
      }
    },
  },
  beforeUnmount() {
  },
});
</script>
