<template>
  <q-card dense flat v-if="Service" class="input-field-permission-editor">
    <q-card-section
      v-if="Service.Title"
      class="input-field-permission-title q-pa-none no-wrap"
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
          :values="data"
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
import { defineComponent } from 'vue';
// import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'PermissionEditor',
  // mixins: [mixins.InputFieldMixin],
  emits:['changed'],
  components: {},
  props: {
    Code: { type: String, default: '' },
    Service: { type: Object },
    Permission: { type: Object },
    Step: { type: String, default: '' },
    readonly: { type: Boolean, default: false },
    noDataScope: { type: Boolean, default: false },
  },
  data() {
    return {
      data: undefined,
      hasThis: false,
      permScope: {},
    };
  },
  watch: {
    data() {
      this.hasThis = !!this.data;
    },
    hasThis() {
      if (this.hasThis) {
        // checked from unchecked
        this.data = this.data || {};

        this.$emit('changed', this.data);
      } else {
        // unchecked from checked
        this.data = undefined;
        this.$emit('changed', this.data);
      }
    },
    Permission() {
      this.data = this.Permission;
    },
  },
  computed: {
    permissionData() {
      return (service) => (this.data ? this.data[service] : undefined);
    },
    childrenService() {
      if (!this.Service) return [];
      const children = [];

      for (let i = 0; i < Object.keys(this.Service).length; i += 1) {
        const sk = Object.keys(this.Service)[i];
        const service = this.Service[sk];

        if (
          typeof service === 'object'
          && !Array.isArray(service)
          && ['scope'].indexOf(service) < 0
        ) {
          children.push({ Name: sk, Index: this.Service[sk].Index || 0 });
        }
      }
      return children.sort(
        (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
      ).map((cdn) => cdn.Name);
    },
    childrenStepService() {
      return this.childrenService.filter((s) => Number(s));
    },
    childrenNormalService() {
      return this.childrenService.filter((s) => !Number(s));
    },
  },
  created() {
    this.data = this.Permission;
  },
  methods: {
    childUpdated(v, f) {
      if (!v && this.data && this.data[f]) {
        // this.$set(this.data, f, undefined);
        this.data[f] = undefined;
      } else if (v) {
        this.data = this.data || {};
        // this.$set(this.data, f, v);
        this.data[f] = v;
      }

      this.$emit('changed', this.data);
    },
    scopeChanged() {
      this.$emit('changed', this.data);
    },
  },
});
</script>
<style lang="sass" scoped>
.input-field-permission-editor
  font-size: 12px
  padding: 4px
  .input-field-permission-title
    &.without-scope
      height: 35px
    .data-scope
      margin-left: 32px
  .step-number-icon-wrapper
    border-radius: 50%
    border: 1px solid $grey-7
    height: 20px
    width: 20px
    display: inline-block
    vertical-align: top
    padding: 0
    margin: 0
    margin-right: 4px
    .step-number-icon
      display: block
      height: 20px
      line-height: 20px
      text-align: center
  .permission-field
    &-steps
      margin-left: 32px
      &>.input-field-permission-editor
        min-height: 180px
        min-width: 128px
      &-label
        margin-left: 32px
    &-children
      padding: 0
      margin-left: 16px
</style>

<style lang="sass">
.input-field-permission-editor
  .permission-field-steps.q-card__section
    flex-wrap: wrap !important
</style>
