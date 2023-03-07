<template>
  <span :class="`input-field-agreement-check row items-center no-wrap ${(Field.Options
    && Field.Options.Center) ? 'center full-width justify-center' : ''}`">
    <span class="field-label-empty" v-if="!Field.Options || !Field.Options.Center"></span>
    <div class="row no-wrap items-center relative-position"
      :class="`check ${hasError ? 'input-field--error' : ''}`">
      <q-checkbox
        :class="`check`"
        @input="validate(); $emit('input')"
        v-bind="$attrs"
        v-model="fieldData"
      />

      <div class="input-field-tips" v-if="Field.Tips && Field.Tips.length > 0">
        <span class="input-field-tips-prefix"></span>
        <span class="tips-list">
          <span v-for="(tip, index) in Field.Tips"
            :key="index" class="input-field-tips-tip">
            <span class="input-field-tips-tip-prefix"></span>
            <span v-for="(t, tindex) in fieldTip(tip)" :key="tindex">
              <span v-if="t.Link" class="tip-link">
                <span class="tip-link-prefix"></span>
                <a :href="t.Link">{{t.Text}}</a>
                <span class="tip-link-postfix"></span>
              </span>
              <span v-else class="tip-text">{{t.Text}}</span>
            </span>
            <span class="input-field-tips-tip-postfix"></span>
          </span>
        </span>
        <span class="input-field-tips-postfix"></span>
      </div>

      <div class="input-field--error-tag" v-if="hasError">
        <e-icon name="error"></e-icon>
      </div>
    </div>
  </span>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldAgreementCheck',
  mixins: [mixins.InputFieldMixin],
  fieldInfo: {
    Category: 'Simple',
    Label: '协议同意勾选框',
    Value: 'AgreementCheck',
    Extra: [
      {
        Type: 'Check',
        Label: '居中显示',
        Name: 'Options.Center',
      },
    ],
    Description: '',
  },
  data() {
    return {
      hasError: false,
    };
  },
  watch: {
    fieldData() {
      if (!this.fieldData) {
        this.fieldData = false;
      }
    },
  },
  created() {
    if (!this.fieldData) {
      this.fieldData = false;
    }
  },
  computed: {
    fieldTip() {
      return (tip) => {
        if (!tip || !tip.Text) return '';
        if (!tip.Links || !Array.isArray(tip.Links) || tip.Links.length <= 0) {
          return [{ Text: tip.Text }];
        }

        // process tip with links
        let linkPos = [];
        tip.Links.forEach((tl) => {
          if (!tl || !tl.Text || !tl.Link) return;

          const start = tip.Text.indexOf(tl.Text);
          if (start >= 0) {
            linkPos.push({
              start,
              end: start + tl.Text.length,
              Link: tl.Link,
              File: tl.File,
            });
          }
        });

        const textSplit = [];
        let start = 0;
        linkPos = linkPos.sort((a, b) => a.start - b.start);
        for (let i = 0; i < linkPos.length; i += 1) {
          const lp = linkPos[i];

          const beforeText = tip.Text.substr(start, lp.start - start);
          if (beforeText) {
            textSplit.push({ Text: beforeText });
          }

          textSplit.push({
            Text: tip.Text.substr(lp.start, lp.end - lp.start),
            Link: lp.File
              ? this.$options.filters.serverDocument(lp.File)
              : lp.Link,
          });

          start += lp.end;
        }

        const afterText = tip.Text.substr(start);
        if (afterText) {
          textSplit.push({
            Text: afterText,
          });
        }

        if (textSplit.length > 0) return textSplit;

        return [{ Text: tip.Text }];
      };
    },
  },
  methods: {
    validate() {
      if (this.Field.Required) {
        this.hasError = typeof this.fieldData === 'undefined' || !this.fieldData;
        return !this.hasError;
      }

      const rules = Array.isArray(typeof this.Field.Rules)
        ? this.Field.Rules
        : [this.Field.Rules];

      let isValid = true;
      for (let i = 0; i < rules.length; i += 1) {
        const r = rules[i];

        if (typeof r === 'function') {
          isValid = isValid && r(this.fieldData);
        }
      }

      this.hasError = !isValid;
      return isValid;
    },
  },
});
</script>
