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
import { defineComponent, getCurrentInstance, computed } from 'vue';
import useAppStore from '@/stores/app';

export default defineComponent({
  name: 'SelectLocales',
  props: {
    icon: { type: String, default: 'translate' },
  },
  setup() {
    const { proxy:vm } = getCurrentInstance();

    const appStore = useAppStore();

    const localeChanged = (l) => {
      vm.$i18n.locale = l;
      appStore.SET_LOCALE(l);
    }

    const locales = computed(() => (vm.ctx.config.locales) || []);
    const locale = appStore.locale || vm.ctx.config.defaultLocale || (locales.value && (locales.value.length > 0) && locales.value[0].locale) || 'zh-cn';

    localeChanged(locale);

    return {
      locales,
      localeChanged,
    };
  },
});
</script>
