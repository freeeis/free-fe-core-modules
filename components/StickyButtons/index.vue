<template>
  <q-page-sticky
    class="print-hide sticky-button"
    :position="position"
    :offset="stickyOffset"
    v-if="visibleActions && visibleActions.length > 0"
  >
    <div v-if="!fab" class="column">
      <q-btn
        v-for="(action, index) in visibleActions"
        :key="index"
        fab
        :icon="action.icon || ''"
        :class="[action.class || '', `sticky-button-${action.Action}`]"
        @click="$emit('click', action)"
        :disable="draggingSticky"
        v-touch-pan.prevent.mouse="moveSticky"
        :label="showLabel ? action.Label : ''"
      />
    </div>
    <q-fab
      v-else
      :icon="fabIcon"
      :direction="direction"
      :color="stickyColor"
      :disable="draggingSticky"
      v-touch-pan.prevent.mouse="moveSticky"
    >
      <q-fab-action
        v-for="(action, index) in visibleActions"
        :key="index"
        @click="$emit('click', action)"
        :class="[action.class || '', `sticky-button-${action.Action}`]"
        :icon="action.icon || ''"
        :disable="draggingSticky"
        :label="showLabel ? action.Label : ''"
      />
    </q-fab>
  </q-page-sticky>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StickyButtons',
  emits: ['click'],
  props: {
    position: { type: String, default: 'bottom-right' },
    offset: { type: Array, default: () => [36, 128, 0, 0] },
    fab: { type: Boolean, default: true },
    fabIcon: { type: String, default: 'add' },
    fabColor: { type: String, default: '' },
    direction: { type: String, default: 'up' },
    actions: { type: Array, default: () => [] },
    showLabel: { type: Boolean, default: true },
    buttonsVisible: { type: Function, default: () => true },
  },
  data() {
    return {
      stickyOffset: [36, 128, 0, 0],
      draggingSticky: false,
    };
  },
  created() {
    if (this.offset) {
      this.stickyOffset = this.offset;
    }
  },
  computed: {
    stickyColor() {
      return this.fabColor || this.ctx.config.stickyColor;
    },
    visibleActions() {
      let actions = [];
      (this.actions || []).filter(act => this.buttonsVisible(act)).forEach((action) => {
        if (Array.isArray(action)) {
          actions = actions.concat(action);
        } else {
          actions.push(action);
        }
      });

      return actions;
    },
  },
  methods: {
    moveSticky(ev) {
      this.draggingSticky = ev.isFirst !== true && ev.isFinal !== true;

      this.stickyOffset = [
        this.stickyOffset[0] - ev.delta.x,
        this.stickyOffset[1] - ev.delta.y,
      ];
    },
  },
});
</script>
