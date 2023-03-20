<template>
  <div class="leveled-menu">
    <slot name="top"></slot>
    <span v-for="(m,index) in menus" :key="index">
      <q-expansion-item
        v-if="!m.Sub || m.Sub.length <= 0"
        clickable
        class="simple"
        :class="group"
        :to="m.Route"
        expand-icon-class="simple-expand-icon"
        :ref="`menuItem_${group}_index`"
      >
        <template v-slot:header>
          <div class="header row full-width">
            <q-item-section v-if="showIcon && m.Icon" avatar>
              <q-icon class="leaf-icon" :name="m.Icon"></q-icon>
            </q-item-section>
            <q-item-section>
              <div class="q-item__label leaf-label">{{$t(m.Label)}}</div>
            </q-item-section>
            <q-item-section side
              class="leaf-expand-icon">
              <q-icon
                v-if="leafIcon"
                :name="leafIcon"
              ></q-icon>
            </q-item-section>
          </div>
        </template>
      </q-expansion-item>

      <q-expansion-item
        v-if="m.Sub && m.Sub.length > 0"
        :value="m.Sub.filter(s => $route.fullPath.startsWith(s.Route)).length > 0"
        exact
        class="expansion"
        :class="group"
        :dense-toggle="dense"
        expand-icon-class="expansion-icon"
        :expand-icon="expandIcon"
        :expanded-icon="expandedIcon"
        :group="group"
        :content-inset-level="inset ? insetLevel || (showIcon ? 0.6 : 0.4) : undefined"
        expand-separator
        :icon="(showIcon && m.Icon) ? m.Icon : undefined"
        :label="$t(m.Label)"
        :to="m.Route"
        :ref="`menuItem_${group}_index`"
      >
        <leveled-menus
          :menus="m.Sub"
          :group="`${group}_${index}`"
          :showIcon="showIcon"
          :insetLevel="insetLevel"
          :dense="dense"
          :leafIcon="leafIcon"
          :leafExpandedIcon="leafExpandedIcon"
          :expandedIcon="expandedIcon"
          :expandIcon="expandIcon"
        ></leveled-menus>
      </q-expansion-item>
    </span>
    <slot name="bottom"></slot>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LeveledMenus',
  props: {
    group: { type: String, default: 'DEFAULT' },
    menus: { type: Array },
    showIcon: { type: Boolean, default: true },
    inset: { type: Boolean, default: true },
    insetLevel: { type: Number, default: 0 },
    dense: { type: Boolean, default: false },
    leafIcon: { type: String, default: undefined },
    leafExpandedIcon: { type: String, default: undefined },
    expandIcon: { type: String, default: undefined },
    expandedIcon: { type: String, default: undefined },
  },
});
</script>

