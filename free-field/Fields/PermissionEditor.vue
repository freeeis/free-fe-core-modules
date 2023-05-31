<template>
  <q-card dense flat v-if="Service" class="free-field-permission-editor">
    <q-card-section
      v-if="Service.Title"
      class="free-field-permission-title q-pa-none no-wrap"
      :class="!!Service.Scope && Service.Scope.length > 0 && !readonly
        ? 'with-scope' : 'without-scope'">
      <q-checkbox v-model="hasThis" :readonly="readonly">
        <div class="row no-wrap">
          <span class="step-number-icon-wrapper" v-if="Step">
            <span class="step-number-icon">{{Step}}</span>
          </span>
          <span class="step-title no-wrap" style="white-space: nowrap; overflow: hidden;">
            {{Service.Title}}
            <span v-if="Code" class="permission-code">({{Code}})</span>
          </span>
        </div>
      </q-checkbox>
      <div v-if="!noDataScope && !!Service.Scope && Service.Scope.length > 0 && !readonly"
          class="data-scope">
        <free-field
          v-for="(scope, index) in Service.Scope"
          :key="index"
          :Field="{
            Type: 'Select',
            Label: scope.Label,
            Name: `Scope.${scope.Field}`,
            Options: scope.Options || [],
          }"
          :values="fieldData"
          @input="scopeChanged"
        />
      </div>
    </q-card-section>

    <q-card-section v-if="childrenNormalService.length" class="permission-field-children">
      <permission-editor
        v-for="(service, index) in childrenNormalService"
        :key="index"
        :Service="Service[service]"
        :Code="service"
        :readonly="readonly"
        :Permission="permissionData(service)"
        @changed="childUpdated($event, service)"
        :noDataScope="noDataScope"
      ></permission-editor>
    </q-card-section>

    <div v-if="childrenStepService.length" class="permission-field-steps-label">步骤:</div>
    <q-card-section v-if="childrenStepService.length"
      horizontal class="permission-field-steps">
      <permission-editor
        v-for="(service, index) in childrenStepService"
        :key="index"
        :Step="service"
        :Service="Service[service]"
        style="border: 1px solid grey;"
        :Permission="permissionData(service)"
        :readonly="readonly"
        @changed="childUpdated($event, service)"
        :noDataScope="noDataScope"
      ></permission-editor>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, watchEffect, watch, computed } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';

export default defineComponent({
  name: 'PermissionEditor',
  emits:['changed'],
  props: {
    ...freeFieldProps,
    Code: { type: String, default: '' },
    Service: { type: Object },
    Permission: { type: Object },
    Step: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    noDataScope: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const { fieldData, setFieldData } = useFreeField(props);

    const hasThis = ref(false);

    watchEffect(() => {
      hasThis.value = !!fieldData.value;
    })

    const scopeChanged = () => {
      emit('changed', fieldData.value);
    };

    const childUpdated = (v, f) => {
      if (!v && fieldData.value && fieldData.value[f]) {
        fieldData.value[f] = undefined;
      } else if (v) {
        fieldData.value = fieldData.value || {};
        fieldData.value[f] = v;
      }

      scopeChanged();
    };

    const permissionData = (service) => (fieldData.value ? fieldData.value[service] : undefined);

    const childrenService = () => {
      if (!props.Service) return [];
      const children = [];

      for (let i = 0; i < Object.keys(props.Service).length; i += 1) {
        const sk = Object.keys(props.Service)[i];
        const service = props.Service[sk];

        if (
          typeof service === 'object'
          && !Array.isArray(service)
          && ['scope'].indexOf(service) < 0
        ) {
          children.push({ Name: sk, Index: props.Service[sk].Index || 0 });
        }
      }
      return children.sort(
        (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
      ).map((cdn) => cdn.Name);
    };

    const childrenStepService = computed(() => childrenService().filter((s) => Number(s)));

    const childrenNormalService = computed(() => childrenService().filter((s) => !Number(s)));

    watchEffect(() => {
      fieldData.value = props.Permission;
    })

    watch(hasThis, (v) => {
      if (v) {
        // checked from unchecked
        fieldData.value = fieldData.value || { has: true };
      } else {
        // unchecked from checked
        fieldData.value = undefined;
        setFieldData(undefined);
      }
      scopeChanged();
    })

    return {
      fieldData: fieldData.value,
      hasThis,
      childUpdated,
      scopeChanged,
      permissionData,
      childrenStepService,
      childrenNormalService,
    };
  },
});
</script>
