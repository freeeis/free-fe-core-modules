<template>
  <q-btn flat :icon="icon" v-if="locales && locales[1]">
    <q-menu>
      <q-list>
        <q-item
          v-for="(locale, index) in locales"
          :key="index"
          clickable
          v-close-popup
          @click="localeChanged(locale.locale)"
            :active="$i18n.locale === locale.locale"
        >
          <q-item-section>{{locale.name}}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<script>
import { defineComponent } from 'vue';
import useAppStore from '@/stores/app';

export default defineComponent({
  name: 'SelectLocales',
  props: {
    icon: { type: String, default: 'translate' },
  },
  computed: {
    locales() {
      return (this.ctx && this.ctx.config.locales) || [];
    },
  },
  created() {
    const appStore = useAppStore();
    this.$i18n.locale = appStore.locale || (this.locales && (this.locales.length > 0) && this.locales[0]);
  },
  methods: {
    localeChanged(l){
      const store = useAppStore();

      this.$i18n.locale = l;
      store.SET_LOCALE(l);
    }
  }
});
</script>
