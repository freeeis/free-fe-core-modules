<template>
  <div>
    <q-stepper
      class="step-left flow-step system-config-wrapper"
      v-if="data && data.StepsDefinition && data.StepsDefinition.length"
      v-model="currentStep"
      animated
      header-nav
    >
      <q-step
        v-for="(step, index) in data.StepsDefinition"
        :key="index"
        :name="step.Index"
        :title="step.Name"
        :caption="step.Description"
        :icon="step.Icon"
        :prefix="index + 1"
      >
        <div
          v-if="step.Actions && step.Actions.length"
          class="flow-action-buttons"
        >
          <span
            v-for="(action, aIndex) in step.Actions || []"
            :key="aIndex"
          >
            <q-btn
              :class="`q-ma-md flow-action-btn-${action.Action || 'unknown'}`"
              v-if="!Array.isArray(action) && buttonsVisible(action)"
              :label="action.Label"
              :icon="action.Icon"
              @click="permformActions(action)"
            ></q-btn>
            <q-btn-group
              v-if="Array.isArray(action)"
              push
              class="q-ma-sm"
            >
              <span
                v-for="(subAction, saIndex) in action"
                :key="saIndex"
                :class="saIndex < action.length - 1 ? 'q-mr-sm' : ''"
              >
                <q-btn
                  v-if="buttonsVisible(subAction)"
                  :label="subAction.Label"
                  :icon="subAction.Icon"
                  @click="permformActions(subAction)"
                  :class="`flow-action-btn-${subAction.Action
                      || 'unknown'} ${((subAction.Value === data.Status)
                    || (subAction.Value === data.Enabled)) ?
                    ' selected': ''}`"
                ></q-btn>
              </span>
            </q-btn-group>
          </span>
        </div>

        <div class="flow-step-input-fields">
          <free-field
            v-for="(field, fIndex) in step.Fields || []"
            :key="fIndex"
            :values="field"
            :Field="configField(field)"
            @input="fieldChanged(field)"
          ></free-field>
        </div>
      </q-step>
    </q-stepper>

    <sticky-buttons
      :actions="[{Action: 'save', icon: 'save', Label:$t('saveButtonText')}]"
      @click="permformActions"
      :fab="false"
    ></sticky-buttons>
  </div>
</template>

<script>
import mixins from 'free-fe-mixins';
import { updateConfig } from '../../router/system/api';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'SystemConfigPage',
  mixins: [mixins.ObjectDataMixin],
  props: {
    buttonsVisible: { type: Function, default: () => true },
  },
  data() {
    return {
      currentStep: 1,
      changedFields: [],
      Actions: {
        save: (a, that) => {
          if (!that.changedFields.length) return;

          const updateFuncs = [];

          that.changedFields.forEach((f) => {
            updateFuncs.push(updateConfig({ id: f.id, Value: f.Value }));
          });

          if (updateFuncs.length) {
            Promise.all(updateFuncs).then((vs) => {
              const failed = vs.find((v) => !v || v.msg !== 'OK');
              if (failed) {
                that.$q.notify(that.$t('notifySaveFailed'));
              } else {
                that.$q.notify(that.$t('notifySaved'));
              }
            });
          }
        },
      },
    };
  },
  computed: {
    configField() {
      return (field) => ({ ...field, ...field.Field });
    },
  },
  methods: {
    permformActions(a) {
      if (!a.Action) return;

      if (
        this.Actions[a.Action]
        && typeof this.Actions[a.Action] === 'function'
      ) {
        this.Actions[a.Action](a, this);
      } else {
        this.$q.notify(`(${a.Action})${this.$t('notifyActionNotExist')}`);
      }
    },
    fieldChanged(field) {
      if (!field) return;
      const existCF = this.changedFields.find((cf) => cf.id === field.id);
      if (!existCF) {
        this.changedFields.push({ id: field.id, Value: field.Value });
      } else {
        // exists
        existCF.Value = field.Value;
      }
    },
  },
  beforeUnmount() { },
});
</script>
