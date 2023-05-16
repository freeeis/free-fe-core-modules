<template>
  <div class="theme-switch-wrapper" :class="{ hide }">
    <div class="theme-components-list" v-if="theme">
      <component
        v-for="(tc, idx) in themeComponents[theme]"
        :key="idx"
        :is="tc"></component>
    </div>
    <q-btn
      flat
      :icon="icon"
      v-if="themes && themes[1]"
      :label="dense ? '' : $t('SwitchTheme')">
      <q-menu>
        <q-list>
          <q-item
            v-for="(tm, index) in themes"
            :key="index"
            clickable
            v-close-popup
            @click="theme = tm"
            :active="theme === tm"
          >
            <q-item-section>{{$t(tm)}}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import useAppStore from '@/stores/app';

export default defineComponent({
  name: 'ThemeSwitch',
  props: {
    icon: { type: String, default: 'fas fa-palette' },
    dense: { type: Boolean, default: true },
    hide: { type: Boolean, default: false },
  },
  data() {
    return {
      theme: '',
    };
  },
  computed: {
    themeComponents() {
      const components = {};

      Object.keys(this.ctx.modules)
        .filter((m) => this.ctx.modules[m].themeComponents)
        .forEach((m) => {
          // can have same theme from diff modules
          Object.keys(this.ctx.modules[m].themeComponents || {}).forEach((ck) => {
            if (this.theme && this.theme !== ck) return;

            const theComp = this.ctx.modules[m].themeComponents[ck];
            components[ck] = components[ck] || [];
            components[ck].push(theComp);
          });
        });

      return components;
    },
    themes() {
      const themeList = {};

      Object.keys(this.ctx.modules)
        .filter((m) => this.ctx.modules[m].themeComponents)
        .forEach((m) => {
          Object.keys(this.ctx.modules[m].themeComponents || {}).forEach((ck) => {
            themeList[ck] = true;
          });
        });

      return Object.keys(themeList);
    },
  },
  watch: {
    theme(v) {
      if (v) {
        const appEle = document.getElementsByTagName('body')[0];

        let arr = appEle?.className.split(' ');

        if (arr) {
          arr = arr.filter(cl => !cl.startsWith('theme-'));

          arr?.push(`theme-${v}`);

          appEle.className = arr.join(' ');
        }

        const appStore = useAppStore();
        appStore.SET_THEME(v);
      }
    },
  },
  created() {
    const appStore = useAppStore();
    this.theme = appStore.theme || this.ctx.config.defaultTheme || (this.themes && (this.themes.length > 0) && this.themes[0]);
  },
});
</script>

<style lang="scss" scoped>
.theme-switch-wrapper {
  &.hide {
    visibility: hidden;
    height: 0;
    width: 0;
  }
}
</style>
