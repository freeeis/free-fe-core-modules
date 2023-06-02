import { watch, onMounted, nextTick, getCurrentInstance } from "vue";
import { useRoute } from 'vue-router';

export function useAnchor(opts) {
  const { proxy:vm } = getCurrentInstance();
  const route = useRoute();

  const goToPageAnchor = (astr) => {
    const anchorStr = astr || route.params.anchor || route.query.anchor;
    if (anchorStr) {
      const anchor = vm.$el.querySelector(`#${anchorStr}`);
      if (anchor && anchor.scrollIntoView) {
        nextTick(() => {
          anchor.scrollIntoView({
            behavior: 'smooth',
            ...opts,
          });
        });
      }
    }
  };

  watch(() => route, () => {
    goToPageAnchor();
  });

  onMounted(() => {
    goToPageAnchor();
  });

  return {
    goToPageAnchor,
  }
};

