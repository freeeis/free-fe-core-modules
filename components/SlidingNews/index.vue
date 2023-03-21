<template>
  <div
    v-if="visible"
    class="row full-width sliding-news justify-center"
    :class="(data && data.length) ? '' : 'empty'"
  >
    <span class="sliding-news-label row items-center">
      <e-icon
        :name="icon"
        class="sliding-news-label-icon"
      ></e-icon>
      <span>{{label}}</span>
    </span>
    <q-carousel
      v-model="slide"
      ref="carousel"
      :transition-prev="transitionPrev"
      :transition-next="transitionNext"
      class="col"
      :height="heightString"
      :autoplay="interval"
      :navigation="false"
      animated
      infinite
      padding
      vertical
    >
      <q-carousel-slide
        v-for="(carouse, index) in data"
        :key="index"
        :name="index"
        @click="newsClicked(carouse)"
        style="cursor: pointer; padding: 0; margin: 0;"
      >
        <div class="row items-center justify-center full-height">
          <span class="sliding-news-title">{{carouse.Title}}</span>
          <q-space />
          <span class="float-right sliding-news-right">
            <span
              class="sliding-news-date"
              :style="`line-height: ${heightString}`"
            >
              {{filter('normalDate',(carouse.PublishDate || carouse.LastUpdateDate))}}
            </span>
          </span>
        </div>
      </q-carousel-slide>
    </q-carousel>
    <q-space />
    <span
      class="float-right sliding-news-right full-height"
      style="margin: auto 0"
    >
      <q-btn
        v-if="closable"
        icon="close"
        flat
        dense
        round
        @click.stop="visible=false"
        class="sliding-news-close-btn"
      ></q-btn>
    </span>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useObjectData, objectDataProps } from '../../composible/useObjectData';

export default defineComponent({
  name: 'SlidingNews',
  props: {
    ...objectDataProps,
    interval: { type: Number, default: 3000 },
    height: { type: String, default: '40px' },
    width: { type: String, default: '100%' },
    lines: { type: Number, default: 1 },
    icon: { type: String, default: 'menu' },
    label: { type: String, default: 'News: ' },
    closable: { type: Boolean, default: true },
    url: { type: String, default: '' },
    transitionPrev: { type: String, default: 'slide-up' },
    transitionNext: { type: String, default: 'slide-down' },
  },
  setup(props, ctx) {
    const {
      data,
      refreshData,
    } = useObjectData(props, ctx);

    return {
      data, 
      refreshData,
    };
  },
  data() {
    return {
      visible: true,
      slide: 0,
      timer: undefined,
    };
  },
  computed: {
    heightString() {
      if (!this.height) return '40px';

      const num = this.height.match(/^[0-9]*/g);
      if (!num || num.length <= 0) return '40px';

      if (num[0] === this.height) return `${this.height}px`;

      return this.height;
    },
  },
  // watch: {
  //   visible() {
  //     if (!this.visible) {
  //       clearInterval(this.timer);
  //     }
  //   },
  // },
  // created() {
  //   this.timer = setInterval(this.carouselNext, this.interval);
  // },
  methods: {
    newsClicked(news) {
      let url = '';
      if (news.url) url += news.url;
      else if (this.url) url += `${this.url}${news.id || ''}`;

      if (url && this.$route.fullPath !== url) {
        this.$router.push({ path: url });
      }
    },
    // carouselNext() {
    //   if (!this.data || this.data.length < 2 || !this.$refs.carousel) {
    //     return;
    //   }

    //   this.$refs.carousel.next();
    // },
  },
  // beforeUnmount() {
  //   clearInterval(this.timer);
  // },
});
</script>
