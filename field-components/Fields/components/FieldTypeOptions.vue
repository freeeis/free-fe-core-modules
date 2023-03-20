<template>
  <span v-if="Field" class="simple-field input-field-field-type-options row items-center no-wrap">
    <q-input
      :value="optionLabel"
      hide-bottom-space
      readonly
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
          v-if="Field.Label !== void 0"
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
                          <q-item-label>{{ option.Label }}</q-item-label>
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
import { defineComponent, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../components/useFreeField';

export default defineComponent({
  name: 'FieldTypeOptions',
  props: {
    ...freeFieldProps,
  },
  emits: ['updateOptions'],
  setup(props, { emit }) {
    if (!props.Field) return {};

    const { proxy:vm } = getCurrentInstance();
    const { fieldData, setFieldData } = useFreeField(props);

    const leftTab = ref('Static');
    const splitter = ref(10);
    const optionLabel = ref('');
    const fieldCategory = ref([]);

    const demoField = computed(() => {
      if (!props.Field.Options) return [];

      const f = props.Field.Options.find((o) => o.Value === fieldData.value);

      return f?.fieldInfo?.demoField || [];
    });

    const demoData = computed(() => {
      if (!props.Field.Options) return {};

      const f = props.Field.Options.find((o) => o.Value === fieldData.value);

      return f?.fieldInfo?.demoData || {};
    });

    const categoryList = computed(() => fieldCategory.value.map((fc) => fc.Name));

    const categoryFields = computed(() => {
      return (c) => {
        const cat = fieldCategory.value.find((fc) => fc.Name === c);
        if (cat) return cat.Fields || [];
        return [];
      };
    });

    const getTypeOptions = async () => {
      const typeOptions = [];
      for (let i = 0; i < Object.keys(vm.ctx.FieldComponents).length; i += 1) {
        const fk = Object.keys(vm.ctx.FieldComponents)[i];
        let fc = vm.ctx.FieldComponents[fk];

        if (typeof fc === 'function') {
          fc = await fc();
          fc = fc.default || fc;
        }

        if (fc && fc.fieldInfo) {
          typeOptions.push(fc.fieldInfo);

          if (fc.fieldInfo.Value === fieldData.value) {
            optionLabel.value = fc.fieldInfo.Label;
          }

          // category
          const info = fc.fieldInfo;
          if (info.Category) {
            if (fieldCategory.value.findIndex((cl) => cl.Name === info.Category) < 0) {
              fieldCategory.value.push({ Name: info.Category, Fields: [info] });
            } else {
              const c = fieldCategory.value.find((cat) => cat.Name === info.Category);
              if (c) {
                c.Fields = c.Fields || [];
                c.Fields.push(info);
              }
            }
          } else if (fieldCategory.value.findIndex((cl) => cl.Name === 'Others') < 0) {
            fieldCategory.value.push({ Name: 'Others', Fields: [info] });
          } else {
            const c = fieldCategory.value.find((cat) => cat.Name === 'Others');
            if (c) {
              c.Fields = c.Fields || [];
              c.Fields.push(info);
            }
          }
        }
      }

      emit('updateOptions', { Name: props.Field.Name, Options: typeOptions });
    };
    const getFieldOptionLabel = () => {
      const opt = props.Field.Options.find((op) => op.Value === fieldData.value);
      if (opt) optionLabel.value = opt.Label;
    };

    const typeChanged = (option) =>{
      if (option.DataType) {
        Object.setValue(props.values, 'DataType', option.DataType);
      }

      setFieldData(option.Value, emit);

      getFieldOptionLabel();
    };

    return {
      fieldData,
      leftTab,
      splitter,
      optionLabel,
      fieldCategory,

      demoField,
      demoData,
      categoryList,
      categoryFields,

      getTypeOptions,
      getFieldOptionLabel,
      typeChanged,
    };
  },
  async created() {
    this.getTypeOptions();
    this.getFieldOptionLabel();
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
