<template>
  <div>
    <component v-if="theme" :is="themeComponents[theme]"></component>
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

export default defineComponent({
  name: 'ThemeSwitch',
  props: {
    icon: { type: String, default: 'fas fa-palette' },
    dense: { type: Boolean, default: true },
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
        .filter((m) => this.ctx.modules[m].IsTheme)
        .forEach((m) => {
          Object.assign(components, this.ctx.modules[m].components || {});
        });

      return components;
    },
    themes() {
      return Object.keys(this.themeComponents);
    },
  },
  watch: {
    theme(v) {
      if (v) {
        const appEle = document.getElementById('q-app');

        let arr = appEle.className.split(' ');

        arr = arr.filter(cl => !cl.startsWith('theme-'));

        arr.push(`theme-${v}`);

        appEle.className = arr.join(' ');
      }
    },
  },
  created() {
    if (this.themes && this.themes.length > 0) {
      this.theme = this.themes[0];
    }
  },
});
</script>
