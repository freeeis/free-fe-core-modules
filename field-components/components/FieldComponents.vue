<template>
  <div
    v-if="Field"
    :class="`free-field-wrapper ${localField.Label
    && localField.Label.trim().length ? 'with-label'
      : 'without-label'} ${Field.Label ?
      'free-field-wrapper-'+Field.Label : ''} ${Field.Name ?
      'free-field-wrapper-'+dashedName : ''} ${(Field && Field.Info)
        ? (Field.Info.Classes || '') : ''}`"
  >
    <component
      :style="shouldHide ? 'display: none;' : ''"
      :is="realComp"
      :Field="localField"
      :modelValue="values"
      :ref="`input_field_validator_${localField.Name || localField.Label}`"
      :class="[
        (localField && localField.ReadOnly) ? 'free-field--readonly' : '',
        (!shouldHide && hasError) ? 'hasError' : ''
      ]"
      @input="inputChanged"
      v-bind="Object.assign({},vBindValue(localField))"
    >
      <template
        v-for="slt in ((Field && Field.Slots) || [])"
        v-slot:[slt]="props"
        >
        <slot :name="slt" v-bind="props"></slot>
      </template>
    </component>
  </div>
</template>

<script>
import { defineComponent, markRaw } from 'vue';
import mixins from 'free-fe-mixins';

// TODO: any other solution to replace the eval??
const evalFunc = (cond, pName = 'data') => {
  const funcStr = `
  (${pName}) => {
    return ${cond};
  }
  `;

  try {
    // eslint-disable-next-line no-eval
    return eval(funcStr);
  } catch (ex) {
    return undefined;
  }
};

export default defineComponent({
  name: 'FreeField',
  mixins: [mixins.ObjectDataMixin, mixins.InputFieldValidator],
  emits: ['input'],
  props: {
    Field: { type: Object },
    values: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      realComp: undefined,
    };
  },
  computed: {
    dashedName() {
      return (this.Field.Name || '').replace(/\./g, '-');
    },
    shouldHide() {
      if (!this.Field) {
        return true;
      }

      // show when
      if (this.Field.Info && this.Field.Info.ShowWhen) {
        const theFunc = evalFunc(this.Field.Info.ShowWhen);
        if (typeof theFunc !== 'function') {
          return true;
        }
        const condResult = theFunc(this.data);
        if (!condResult) return true;
      }

      // hide (when)
      if (this.Field.Hidden
        && this.Field.Info
        && this.Field.Info.HideWhenUndefined) {
        const checkField = this.Field.Info.HideWhenUndefinedField || this.Field.Name;
        if (checkField) {
          const fList = checkField.split(',');
          for (let i = 0; i < fList.length; i += 1) {
            const fl = fList[i];

            const flv = Object.nestValue(this.data, fl.trim());
            if (typeof flv === 'undefined') return true;

            if (this.Field.Info.IncludeEmptyObject) {
              return !Object.hasValue(flv);
            }
          }
          return false;
        }
      }

      return this.Field.Hidden;
    },
    localField() {
      const rules = [];
      const lField = { ...this.Field };
      lField.Rules = lField.Rules || [];
      for (let i = 0; i < lField.Rules.length; i += 1) {
        const rule = lField.Rules[i];

        if (typeof rule === 'string' && this.ctx.validators[rule] && this.ctx.validators[rule].validator) {
            lField.Rules[i] = this.ctx.validators[rule].validator;
          }
      }

      if (lField.Required) {
        rules.push(val => val !== void 0 && val !== '');
      }

      lField.rules = [].concat(this.Field.Rules).concat(rules).concat(lField.rules);

      return lField;
    },
    vBindValue() {
      return (d) => {
        if (!d || typeof d !== 'object') return {};

        const ret = {};
        Object.keys(d).forEach((dk) => {
          if (!dk) return;

          if (
            dk.charAt(0) === dk.charAt(0).toLowerCase()
            || ['Placeholder', 'ReadOnly'].indexOf(dk) >= 0
          ) {
            switch (dk) {
              case 'Placeholder':
                ret.placeholder = d[dk];
                break;
              case 'ReadOnly':
                ret.readonly = d[dk];
                break;
              default:
                ret[dk] = d[dk];
                break;
            }
          }
        });

        return ret;
      };
    },
  },
  watch: {
    // eslint-disable-next-line func-names
    'Field.Type': function (nv) {
      if (!this.realComp || this.realComp.name !== nv) {
        this.getRRealComp();
      }
    },
  },
  created() {
    this.getRRealComp();

    if (this.Field && this.Field.Info && this.Field.Info.KeepChanged) {
      this.$nextTick(() => {
        this.$emit('input', this.Field);
      });
    }
  },
  methods: {
    getRRealComp() {
      // all components
      const fComponents = this.ctx ? this.ctx.FieldComponents || {} : {};
      let field;

      // for some specified types
      if (this.Field.Component) {
        field = this.Field.Component;
      } else if (this.Field.Type === 'Select' && this.Field.AsRadio) {
        field = fComponents.RadioList;
      } else {
        if(typeof this.Field.Type === 'undefined') {
          field = fComponents.String;
        } else {
          field = fComponents[this.Field.Type] || this.Field.Type;
        }
      }

      this.realComp = field && markRaw(field);
      // return field;
    },
    inputChanged(f) {
      this.$emit('input', f || this.Field);
    },
  },
});
</script>

<style lang="sass">
@import '../style.sass'

.free-field-wrapper
  width: 100%
  .free-field-wrapper
    width: unset
  .simple-field
    // display: inline-block
    width: 100%
  .free-field-range-separator
    margin: 0 6px
  .field-label-empty
    display: inline-block
    margin-left: 0
    padding-left: 0
    width: $fieldLabelWidth
    min-width: $fieldLabelWidth

  .field-label
    display: inline-block
    margin-left: 0
    padding-left: 0
    font-size: $fieldLabelFontSize
    width: $fieldLabelWidth
    min-width: $fieldLabelWidth
    color: $fieldLabelColor
    text-align: right
    white-space: normal

  .field-label:after
    content: $fieldLabelAfter

  .required-mark
    color: $fieldLabelRequiredColor
    position: relative
    top: 3px

  .q-uploader
    flex: 1
    box-shadow: unset

</style>
