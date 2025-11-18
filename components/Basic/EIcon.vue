<template>
  <span class="e-icon justify-center items-center">
    <q-icon v-if="isIcon" class="full-width full-height" :name="name"></q-icon>
    <q-img v-else class="full-width full-height" style="display: block;" :src="imgPath" round>
      <slot></slot>
      <template v-slot:error v-if="!hideError">
        <div class="error-slot column absolute-full justify-center text-center">
          <span class="no-picture-text full-width">{{ noImageText }}</span>
        </div>
      </template>
    </q-img>
  </span>
</template>

<script>
import { ref, computed, defineComponent, getCurrentInstance, watchEffect } from 'vue';

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
  setup(props) {
    const { proxy:vm } = getCurrentInstance();

    const imgPath = ref('');
    watchEffect(() => {
      if (typeof props.name !== 'string' || !props.name) return '';

      if (props.name.startsWith('data:')) return props.name;

      if (props.name.startsWith('http://')) return props.name;

      if (props.name.startsWith('https://')) return props.name;

      if (props.name.startsWith('blob:')) return props.name;

      // TODO:默认使用二倍图？
      if (props.relative) return `${import.meta.env.BASE_URL}images/${props.name}${props.defaultSize}.png`;

      const ret = props.thumb
        ? vm.$filter('serverThumb', props.name)
        : vm.$filter('serverImage', props.name);

      // 某些情况下不能及时显示缩略图，延迟设置图片路径
      setTimeout(() => {
        imgPath.value = ret;
      }, 200);
    })

    return {
      isIcon: computed(() => props.name && (typeof props.name === 'string') && (props.name.startsWith('img:') || props.name.indexOf('/') < 0)),
      imgPath,
    };
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
