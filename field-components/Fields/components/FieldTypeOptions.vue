<template>
  <span v-if="Field" class="simple-field input-field-field-type-options row items-center no-wrap">
    <q-input
      :value="optionLabel"
      hide-bottom-space
      readonly
      v-bind="$attrs"
      :ref="`input_field_validator_date`"
    >
      <template v-slot:before>
        <span
          :class="
            `field-label ${
              Field.Label && Field.Label.trim().length
                ? ''
                : 'field-label-empty'
            } ${Field.Required ? 'required' : ''}`
          "
          v-if="typeof Field.Label !== 'undefined'"
        >
          <q-tooltip v-if="Field.Description" anchor="top right">
            {{
            Field.Description
            }}
          </q-tooltip>
          {{ Field.Label || '' }}
          <span v-if="Field.Required" class="required-mark">*</span>
        </span>
      </template>
      <q-popup-proxy ref="qTypeProxy" transition-show="scale" transition-hide="scale">
        <div class="row input-field-field-type-options-content" style="max-height: 320px">
          <q-card class="full-height" style="min-width: 500px">
            <q-separator />
            <q-splitter v-model="splitter" style="height: 300px">
              <template v-slot:before>
                <q-tabs v-model="leftTab" vertical active-bg-color="grey-4">
                  <q-tab
                    v-for="(category, index) in categoryList"
                    :key="index"
                    ripple
                    :name="category"
                    :label="$t(`fieldCategory${category}`)"
                  ></q-tab>
                </q-tabs>
              </template>

              <template v-slot:after>
                <q-tab-panels
                  v-model="leftTab"
                  animated
                  transition-prev="slide-down"
                  transition-next="slide-up"
                  class="full-height"
                >
                  <q-tab-panel
                    v-for="(category, index) in categoryList"
                    :key="index"
                    :name="category"
                    class="row full-height"
                    style="width: 800px;"
                  >
                    <q-list class="col full-height scroll" style="max-width: 180px">
                      <q-item
                        v-for="(option, index) in categoryFields(category)"
                        :key="index"
                        clickable
                        v-ripple
                        :active="fieldData === option.Value"
                        @click="typeChanged(option)"
                      >
                        <q-item-section>
                          <q-item-label v-html="option.Label" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-card
                      class="col full-height scroll"
                      flat
                      style="min-width: 500px; margin-bottom: 10px; border: 1px solid grey"
                    >
                      <q-card-section>
                        <free-field
                          v-for="(field, index)
                            in (Array.isArray(demoField) ? demoField : [demoField])"
                          :key="index"
                          :Field="field"
                          :values="demoData"
                        ></free-field>
                      </q-card-section>
                      <q-card-section></q-card-section>
                    </q-card>
                  </q-tab-panel>
                </q-tab-panels>
              </template>
            </q-splitter>
          </q-card>
        </div>
      </q-popup-proxy>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer"></q-icon>
      </template>
    </q-input>
  </span>
</template>

<script>
import {defineComponent} from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'FieldTypeOptions',
  mixins: [mixins.InputFieldMixin],
  emits: ['updateOptions'],
  data() {
    return {
      leftTab: 'Static',
      splitter: 10,
      testData: {
        Type: 'String',
        Label: 'Label',
        Name: 'value',
        Required: true,
        value: 'test value',
        Options: [
          {
            Label: 'Option one',
            Value: 'test value',
          },
        ],
        Warning: 'This is some warning message.',
        Description: 'This is some description',
        Tips: [
          {
            Text: 'this is some tip',
          },
        ],
      },
      optionLabel: '',
      fieldCategory: [],
    };
  },
  computed: {
    demoField() {
      if (!this.Field || !this.Field.Options) return [];// this.testData;

      const f = this.Field.Options.find((o) => o.Value === this.fieldData);

      if (f && f.fieldInfo && f.fieldInfo.demoField) {
        return f.demoField;
      }

      return [];// { ...this.testData, Type: this.fieldData };
    },
    demoData() {
      if (!this.Field || !this.Field.Options) return {};// this.testData;

      const f = this.Field.Options.find((o) => o.Value === this.fieldData);

      if (f && f.fieldInfo && f.fieldInfo.demoData) {
        return f.demoData;
      }

      return {};// this.testData;
    },
    categoryList() {
      return this.fieldCategory.map((fc) => fc.Name);
    },
    categoryFields() {
      return (c) => {
        const cat = this.fieldCategory.find((fc) => fc.Name === c);
        if (cat) return cat.Fields || [];
        return [];
      };
    },
  },
  async created() {
    this.getTypeOptions();
    this.getFieldOptionLabel();
  },
  methods: {
    async getTypeOptions() {
      const typeOptions = [];
      for (let i = 0; i < Object.keys(this.ctx.FieldComponents).length; i += 1) {
        const fk = Object.keys(this.ctx.FieldComponents)[i];
        let fc = this.ctx.FieldComponents[fk];

        if (typeof fc === 'function') {
        // eslint-disable-next-line no-await-in-loop
          fc = await fc();
          fc = fc.default || fc;
        }

        if (fc && fc.fieldInfo) {
          typeOptions.push(fc.fieldInfo);

          if (fc.fieldInfo.Value === this.fieldData) {
            this.optionLabel = fc.fieldInfo.Label;
          }

          // category
          const info = fc.fieldInfo;
          if (info.Category) {
            if (this.fieldCategory.findIndex((cl) => cl.Name === info.Category) < 0) {
              this.fieldCategory.push({ Name: info.Category, Fields: [info] });
            } else {
              const c = this.fieldCategory.find((cat) => cat.Name === info.Category);
              if (c) {
                c.Fields = c.Fields || [];
                c.Fields.push(info);
              }
            }
          } else if (this.fieldCategory.findIndex((cl) => cl.Name === 'Others') < 0) {
            this.fieldCategory.push({ Name: 'Others', Fields: [info] });
          } else {
            const c = this.fieldCategory.find((cat) => cat.Name === 'Others');
            if (c) {
              c.Fields = c.Fields || [];
              c.Fields.push(info);
            }
          }
        }
      }

      this.$emit('updateOptions', { Name: this.Field.Name, Options: typeOptions });
    },
    getFieldOptionLabel() {
      const opt = this.Field.Options.find((op) => op.Value === this.fieldData);
      if (opt) this.optionLabel = opt.Label;
    },
    typeChanged(option) {
      this.fieldData = option.Value;
      if (option.DataType) this.data.DataType = option.DataType;

      this.$emit('input');
      this.getFieldOptionLabel();
    },
  },
});
</script>

<style lang="sass">
.input-field-field-type-options
  .q-field__control
    padding: 0 8px
  .input-field-field-type-options-content
    .q-panel
      overflow: hidden
</style>
