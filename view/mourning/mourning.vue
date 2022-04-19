<template>
  <span></span>
</template>

<script>
import store from '../../store';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'mourning',
  mounted() {
    this.getRequest('mourning').then((d) => {
      let inMourning = false;
      if (d && d.data && d.data.mourning) {
        inMourning = true;
      }
      store.commit('app/SET_MOURNING', inMourning);

      let classes = this.$root.$el.className.split(' ').filter((c) => !!c);

      if (inMourning) {
        classes.push('mourning-site');
      } else {
        // remove
        classes = classes.filter((c) => c.trim() !== 'mourning-site');
      }

      this.$root.$el.className = classes.join(' ');
    });
  },
});
</script>

<style lang="sass">
.mourning-site
  -webkit-filter: grayscale(100%)
  -moz-filter: grayscale(100%)
  -ms-filter: grayscale(100%)
  -o-filter: grayscale(100%)
  filter: grayscale(100%)
  filter: progid:DXImageTransform.Microsoft.BasicImage(grayscale=1)
  filter: gray
</style>
