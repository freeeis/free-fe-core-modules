<template>
  <section class="mixed-table-designer">
    <div class="mixed-table-designer__heading">单元格布局</div>
    <div v-if="!rows.length || !columnCount" class="mixed-table-designer__empty">
      请先在画布中添加表格行并设置列数。
    </div>
    <template v-else>
      <div class="mixed-table-designer__grid" :style="gridStyle">
        <button
          v-for="cell in cells"
          :key="cell.key"
          type="button"
          class="mixed-table-designer__cell"
          :class="{ 'mixed-table-designer__cell--selected': isSelected(cell) }"
          :disabled="disabled"
          @click="selectCell(cell)"
        >
          {{ cell.label }}
        </button>
      </div>

      <div v-if="selectedCell" class="mixed-table-designer__editor">
        <div class="mixed-table-designer__selected">{{ selectedCell.label }}</div>
        <q-input
          :model-value="selectedCell.rowspan"
          type="number"
          outlined
          dense
          label="跨行"
          :min="1"
          :max="selectedCell.maxRowspan"
          :disable="disabled"
          @update:model-value="updateSpan('rowspan', $event)"
        />
        <q-input
          :model-value="selectedCell.colspan"
          type="number"
          outlined
          dense
          label="跨列"
          :min="1"
          :max="selectedCell.maxColspan"
          :disable="disabled"
          @update:model-value="updateSpan('colspan', $event)"
        />
      </div>
    </template>
  </section>
</template>

<script>
import { defineComponent } from 'vue';

function positiveInteger(value, fallback = 1) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function cloneRows(rows) {
  return rows.map((row) => {
    const nextRow = { ...row };
    Object.keys(row || {}).forEach((key) => {
      if (/^\d+$/.test(key) && row[key] && typeof row[key] === 'object') {
        nextRow[key] = { ...row[key] };
      }
    });
    return nextRow;
  });
}

export default defineComponent({
  name: 'MixedTableDesigner',
  props: {
    field: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:field'],
  data() {
    return {
      selected: null,
    };
  },
  computed: {
    rows() {
      return Array.isArray(this.field?.Options?.Rows) ? this.field.Options.Rows : [];
    },
    columnCount() {
      return Math.max(0, Math.floor(Number(this.field?.Options?.ColumnNumber) || 0));
    },
    cells() {
      return this.rows.flatMap((row, rowIndex) => Array.from(
        { length: this.columnCount },
        (_, columnIndex) => {
          const value = row?.[columnIndex] || row?.[String(columnIndex)] || {};
          return {
            rowIndex,
            columnIndex,
            key: `${rowIndex}:${columnIndex}`,
            label: `第${rowIndex + 1}行 第${columnIndex + 1}列`,
            rowspan: positiveInteger(value.rowspan),
            colspan: positiveInteger(value.colspan),
            maxRowspan: this.rows.length - rowIndex,
            maxColspan: this.columnCount - columnIndex,
          };
        },
      ));
    },
    selectedCell() {
      if (!this.selected) return null;
      return this.cells.find((cell) => cell.key === this.selected) || null;
    },
    gridStyle() {
      return { gridTemplateColumns: `repeat(${this.columnCount}, minmax(0, 1fr))` };
    },
  },
  methods: {
    isSelected(cell) {
      return this.selected === cell.key;
    },
    selectCell(cell) {
      this.selected = cell.key;
    },
    updateSpan(name, value) {
      const cell = this.selectedCell;
      if (!cell) return;
      const maximum = name === 'rowspan' ? cell.maxRowspan : cell.maxColspan;
      const span = Math.min(maximum, positiveInteger(value));
      const rows = cloneRows(this.rows);
      const row = rows[cell.rowIndex] || {};
      const existing = row[cell.columnIndex] || row[String(cell.columnIndex)] || {};
      rows[cell.rowIndex] = {
        ...row,
        [cell.columnIndex]: { ...existing, [name]: span },
      };
      this.$emit('update:field', {
        ...this.field,
        Options: { ...(this.field.Options || {}), Rows: rows },
      });
    },
  },
});
</script>

<style scoped>
.mixed-table-designer__heading,
.mixed-table-designer__selected {
  color: var(--ffd-color-text, #e4e4e7);
  font-size: var(--ffd-font-size-sm, 12px);
  font-weight: 600;
}

.mixed-table-designer__empty {
  color: var(--ffd-color-text-muted, #a1a1aa);
  font-size: var(--ffd-font-size-sm, 12px);
  margin-top: 8px;
}

.mixed-table-designer__grid {
  display: grid;
  margin-top: 8px;
}

.mixed-table-designer__cell {
  background: var(--ffd-color-surface, #27272a);
  border: 1px solid var(--ffd-color-border-soft, #3f3f46);
  color: var(--ffd-color-text, #e4e4e7);
  font-size: 11px;
  min-height: 36px;
  padding: 4px;
}

.mixed-table-designer__cell--selected {
  background: var(--ffd-color-primary-soft, #1e3a5f);
  border-color: var(--ffd-color-primary, #3b82f6);
}

.mixed-table-designer__editor {
  margin-top: 12px;
}

.mixed-table-designer__editor > * + * {
  margin-top: 8px;
}
</style>
