<template>
  <div
    v-if="visible"
    class="row full-width sliding-news justify-center"
    :class="(localData.length) ? '' : 'empty'"
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
        v-for="(carouse, index) in localData"
        :key="index"
        :name="index"
        @click="newsClicked(carouse)"
        style="cursor: pointer; padding: 0; margin: 0;"
      >
        <div class="row no-wrap items-center justify-center full-height">
          <div class="sliding-news-title col ellipsis">{{carouse.title}}</div>
          <q-space />
          <div class="sliding-news-right"
            :style="`line-height: ${heightString}`">
              {{$filter('normalDate',(carouse.PublishDate || carouse.LastUpdateDate))}}
          </div>
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
import { useRouter, useRoute } from 'vue-router'
import { defineComponent } from 'vue';
import { useObjectData, objectDataProps } from '../../composible/useObjectData';

export default defineComponent({
  name: 'SlidingNews',
  props: {
    ...objectDataProps,
    fields: {
      type: Object,
      default: () => ({
        title: 'Title',
        date: 'LastUpdateDate'
      }),
    },
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
  emits: ['update:modelValue'],
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
      route: useRoute(),
    };
  },
  data() {
    return {
      visible: true,
      slide: 0,
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
    localData() {
      const fks = Object.keys(this.fields || {});
      return (this.data || []).map((dd) => {
        const ret = {};
        for (let i = 0; i < fks.length; i += 1) {
          const fk = fks[i];
          ret[fk] = dd[this.fields[fk]];
        }

        return { ...dd, ...ret };
      });
    },
  },
  methods: {
    newsClicked(news) {
      let url = '';
      if (news.url) url += news.url;
      else if (this.url) url += `${this.url}${news.id || ''}`;

      if (url && this.route.fullPath !== url) {
        this.router.push({ path: url });
      }
    },
  },
});
</script>
