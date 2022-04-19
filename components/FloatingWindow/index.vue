<template>
  <div
    class="z-max"
    id="adbox"
    ref="adbox"
    v-show="showAdbox && img"
    @mouseenter="enterbox"
    @mouseleave="leavebox"
    @click="boxClicked"
  >
    <q-img :src="`${ctx.config.imageUrlBase}${img}`"></q-img>
    <q-btn @click.stop="closebox" flat class="no-shadow" icon="close"></q-btn>
  </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'FloatingWindow',
  props: {
    url: { type: String, default: '' },
    img: { type: String, default: '' },
    onlyIn: { type: Array, default: () => [] },
    top: { type: Number, default: 0 },
  },
  data() {
    return {
      x: 150,
      y: 150,
      xin: true,
      yin: true,
      step: 1,
      delay: 15,
      itl: null,
      showAdbox: true,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.routeEnterShowAdbox();
    });
  },
  beforeUnmount() {
    clearInterval(this.itl);
  },
  mounted() {
    this.leavebox();
  },
  methods: {
    boxClicked() {
      if (this.url) {
        if (/^(http|https):\/\/.*/.test(this.url)) {
          window.open(this.url);
        } else {
          this.$router.push(this.url);
        }
      }
    },
    closebox() {
      this.showAdbox = false;
      clearInterval(this.itl);
    },
    leavebox() {
      if (this.showAdbox === false) {
        clearInterval(this.itl);
      } else {
        this.itl = setInterval(this.movebox, this.delay);
      }
    },
    enterbox() {
      clearInterval(this.itl);
    },
    movebox() {
      const L = 0;
      const T = this.top;
      // 浏览器显示宽度-adbox宽度，不随滚动条变化而变化
      const R = document.documentElement.clientWidth - this.$refs.adbox.offsetWidth;
      // 浏览器显示高度-adbox高度，不随滚动条变化而变化
      const B = document.documentElement.clientHeight - this.$refs.adbox.offsetHeight;
      this.$refs.adbox.style.left = `${this.x
        + document.documentElement.scrollLeft}px`; // adbox初始左+滚动条最左端到浏览器最左端的距离
      this.$refs.adbox.style.top = `${this.y
        + document.documentElement.scrollTop}px`; // adbox初始高+滚动条顶端到浏览器顶端的距离
      this.x += this.step * (this.xin ? 1 : -1);
      if (this.x < L) {
        this.xin = true;
        this.x = L;
      }
      if (this.x > R) {
        this.xin = false;
        this.x = R;
      }
      this.y += this.step * (this.yin ? 1 : -1);
      if (this.y < T) {
        this.yin = true;
        this.y = T;
      }
      if (this.y > B) {
        this.yin = false;
        this.y = B;
      }
    },
    routeEnterShowAdbox() {
      this.itl = setInterval(this.movebox, this.delay);
    },
  },
});
</script>

<style lang="sass">
#adbox
  width: 300px
  height: 150px
  position: absolute
  cursor: pointer

  & img
    border: none

  & .q-btn
    position: absolute
    height: 24px
    width: 24px
    font-size: 14px
    line-height: 24px
    padding: 0
    margin: 0
    right: 5px
    top: 5px
    cursor: pointer
    color: $grey-4
    background: rgba(0,0,0,0.2)
    & .q-btn__wrapper
      padding: 0
      min-height: 1em
    &:hover
      color: $grey-5
      background: $grey-9
</style>
