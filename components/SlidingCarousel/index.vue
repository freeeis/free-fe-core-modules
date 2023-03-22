<template>
  <q-carousel
    animated
    v-model="slide"
    ref="carousel"
    infinite
    :transition-prev="transitionPrev"
    :transition-next="transitionNext"
    :height="heightString"
    :autoplay="interval"
    :arrows="data && data.length > 0"
    :swipeable="swipeable"
    :thumbnails="thumbnails"
  >
    <q-carousel-slide
      v-for="(carouse, index) in data"
      :key="index"
      :name="index"
      :img-src="`${ctx.config.imageUrlBase}${carouse.img}`"
      @click="clicked(carouse)"
    />
    <q-carousel-slide v-if="!data || !data.length" :name="0">
      <div class="no-images-label flex full-height full-width">{{noImageText}}</div>
    </q-carousel-slide>
  </q-carousel>
</template>

<script>
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router'
import { useObjectData, objectDataProps } from '../../composible/useObjectData';

export default defineComponent({
  name: 'SlidingCarousel',
  props: {
    ...objectDataProps,
    interval: { type: Number, default: 3000 },
    height: { type: String, default: '220px' },
    width: { type: String, default: '100%' },
    noImageText: { type: String, default: '暂无图片' },
    transitionPrev: { type: String, default: 'slide-right' },
    transitionNext: { type: String, default: 'slide-left' },
    swipeable: { type: Boolean, default: true },
    thumbnails: { type: Boolean, default: true },
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
  data() {
    return {
      slide: 0,
    };
  },
  computed: {
    heightString() {
      if (!this.height) return '220px';

      const num = this.height.match(/^[0-9]*/g);
      if (!num || num.length <= 0) return '220px';

      if (num[0] === this.height) return `${this.height}px`;

      return this.height;
    },
  },
  methods: {
    clicked(carouse) {
      if (carouse && carouse.url) {
        if (/^(http|https):\/\/.*/.test(carouse.url)) {
        // window.location.href = l;
          window.open(carouse.url);
        } else {
          this.router.push(carouse.url);
        }
      }
    },
  },
});
</script>

<style lang="sass" scoped>
.no-images-label
  font-size: 18px
  font-weight: bold
  justify-content: center
  align-items: center
  background: $grey-5
  color: $background
</style>
