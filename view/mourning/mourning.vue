<template>
  <span></span>
</template>

<script>
import useMourningStore from '../../stores/mourning';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'mourningNode',
  setup() {
    return {};
  },
  mounted() {
    const mourningStore = useMourningStore();

    this.getRequest('mourning').then((d) => {
      let inMourning = false;
      if (d && d.data && d.data.mourning) {
        inMourning = true;
      }
      mourningStore.mourning = inMourning;

      let bodyElem = document.getElementsByTagName('html')[0];
      let classes = bodyElem.className.split(' ').filter((c) => !!c);
    
      if (inMourning) {
        classes.push('mourning-site');
      } else {
        // remove
        classes = classes.filter((c) => c.trim() !== 'mourning-site');
      }

      bodyElem.className = classes.join(' ');
    });
  },
});
</script>

<style lang="scss">
.mourning-site {
  -webkit-filter: grayscale(100%);
  -moz-filter: grayscale(100%);
  -ms-filter: grayscale(100%);
  -o-filter: grayscale(100%);
  filter: grayscale(100%);
  filter: progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);
  filter: gray;
}
</style>
