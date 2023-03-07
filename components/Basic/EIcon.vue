<template>
  <span class="e-icon justify-center items-center">
    <q-icon
      v-if="isIcon"
      class="full-width full-height"
      :name="name"
      v-bind="$attrs"
    ></q-icon>
    <q-img
      v-else
      class="full-width full-height"
      style="display: block;"
      :src="imgPath"
      v-bind="$attrs"
      round
    >
      <slot></slot>
      <template v-slot:error v-if="!hideError">
        <div class="error-slot column absolute-full justify-center text-center">
          <span class="no-picture-text full-width">{{noImageText}}</span>
        </div>
      </template>
    </q-img>
    <!-- <q-icon v-else :name="ctx.config.defaultIcon">he</q-icon> -->
  </span>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EIcon',
  props: {
    name: { type: String, default: '' },
    relative: { type: Boolean, default: true },
    thumb: { type: Boolean, default: false },
    noImageText: { type: String, default: '暂无图片' },
    hideError: { type: Boolean, default: false },
    defaultSize: { type: String, default: '@2x' },
  },
  computed: {
    isIcon() {
      return this.name && (typeof this.name === 'string') && (this.name.startsWith('img:') || this.name.indexOf('/') < 0);
    },
    imgPath() {
      if (typeof this.name !== 'string' || !this.name) return '';

      if (this.name.startsWith('data:')) return this.name;

      if (this.name.startsWith('http://')) return this.name;

      if (this.name.startsWith('https://')) return this.name;

      // TODO:默认使用二倍图？
      if (this.relative) return `images/${this.name}${this.defaultSize}.png`;
      return this.thumb
        ? this.$options.filters.serverThumb(this.name)
        : this.$options.filters.serverImage(this.name);
    },
  },
});
</script>

<style lang="sass" scoped>
.e-icon
  display: inline-block
  position: relative
  font-size: 24px
  max-width: 100%
  max-height: 100%
  min-height: 24px
  min-width: 24px
  .q-icon
    width: 24px
    height: 24px
  .error-slot
    background: $grey-4
    margin: 0
    padding: 0
    .no-picture-text
      position: absolute
      top: 50%
      transform: translateY(-50%)
</style>
