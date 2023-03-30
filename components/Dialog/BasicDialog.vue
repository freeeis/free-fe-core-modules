<template>
  <q-dialog
    :persistent="persistent"
    ref="dialog"
  >
    <q-card
      :class="['basic-dialog-card', dialogClass]"
      :style="`min-height: ${size.h}px;
        width: ${size.w}px; min-width: ${size.w}`"
    >
      <q-btn
        class="float-right close-dialog-button"
        v-if="canClose"
        :icon="closeIcon"
        flat
        v-close-popup
        @click="btnCancel"
      />

      <q-card-section class="column items-center">
        <e-icon
          v-if="type"
          class="dialog-icon"
          :name="icon || type"
          alt=""
        />
        <div
          v-if="content"
          class="title"
        >{{ content }}</div>
        <div
          v-if="tips"
          class="tips"
        >{{ tips }}</div>
        <div
          v-if="warning"
          class="warning no-wrap"
        >
          <span class="warning-icon"></span>
          <span class="warning-icon-sign-top"></span>
          <span class="warning-icon-sign-dot"></span>
          <span class="warning-text ellipsis">{{warning}}</span>
        </div>

        <q-input
          v-if="needText"
          hide-bottom-space
          class="full-width"
          :placeholder="text_label"
          :maxlength="max_text_length"
          v-model="textContent"
          :rows="max_text_length / 20"
          :class="textValid ? '' : 'invalid'"
          type="textarea"
        >
        </q-input>
        <span v-if="needText">{{ textContent.length }}/{{ max_text_length }}</span>
        <div
          v-if="fields && fields.length"
          :class="fieldsClass || ''"
        >
          <free-field
            :class="field.class || ''"
            v-for="(field, index) in fields"
            :key="index"
            :Field="field"
            :values="fieldsData"
            ref="fieldsToValid"
            @cancel="btnCancel"
            @ok="onOKClick"
            @input="onInputFieldInput(field)"
          ></free-field>
        </div>
        <slot name="fields"></slot>
      </q-card-section>

      <q-card-actions
        align="center"
        class="action-buttons full-width absolute"
        v-if="(canOK || canCancel) && !hideActions"
      >
        <q-btn
          :label="cancelText"
          class="cancel-btn"
          v-close-popup
          @click="btnCancel"
          v-if="canCancel"
        />
        <q-btn
          v-if="canOK"
          :label="okText"
          class="ok-btn"
          :class="disabled ? 'disabled-ok-btn' : ''"
          :disabled="disabled"
          @click="onOKClick"
        >
          <span v-if="timeLeft">({{ timeLeft }}s)</span>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useFormValidator } from '../../composible/useFormValidator';
import FreeField from '../../free-field/composible/fieldWrapper';
import EIcon from '../Basic/EIcon.vue';

export default defineComponent({
  name: 'BasicDialog',
  // mixins: [mixins.InputFieldValidator],
  emits: ['hide', 'ok', 'cancel'],
  props: {
    persistent: { type: Boolean, default: true },
    type: { type: String, default: 'info' },
    icon: { type: String, default: '' },
    textAlign: { type: String, default: 'center' },
    content: { type: String, default: '' },
    tips: { type: String, default: '' },
    size: {
      type: Object,
      default: () => ({
        h: 100,
        w: 550,
      }),
    },
    needText: { type: Boolean, default: false },
    text_label: { type: String, default: '' },
    max_text_length: { type: Number, default: 100 },
    hideActions: { type: Boolean, default: false },
    canOK: { type: Boolean, default: true },
    canCancel: { type: Boolean, default: false },
    canClose: { type: Boolean, default: false },
    closeIcon: { type: String, default: 'far fa-times-circle' },
    cancelText: { type: String, default: 'Cancel' },
    cancelType: { type: String, default: '' },
    okDisabled: { type: Boolean, default: false },
    okText: { type: String, default: 'OK' },
    okType: { type: String, default: '' },
    timeout: { type: Number, default: 0 },
    showWarning: { type: Boolean, default: true },
    warning: { type: String, default: '' },
    // validateFunc: {
    //   type: Function,
    //   default: () => true,
    // },
    visible: { type: Boolean, default: true },
    fields: { type: Array, default: () => ([]) },
    fieldsData: { type: Object, default: () => ({}) },
    fieldsClass: { type: String, default: '' },
    dialogClass: { type: String, default: '' },

    remove: { type: Function, default: () => {}}
  },
  components: {
    FreeField,
    EIcon,
  },
  setup(props, { expose, emit }) {
    const { validate } = useFormValidator('fieldsToValid');

    const dialog  = ref(null);

    const timeLeft = ref(0),
      textContent = ref(''),
      textValid = ref(true),
      timer = ref(undefined),
      promise = ref(null),
      resolve = ref(null),
      reject = ref(null);

    const timeout_counter = () => {
      if (!props.timeout) {
        return;
      }

      timeLeft.value = props.timeout;
      timer.value = setInterval(() => {
        timeLeft.value -= 1;
        if (timeLeft.value < 1) {
          clearInterval(timer.value);
          btn_ok();
        }
      }, 1000);
    };

    const show = () => {
      dialog.value.show();
      timeout_counter();

      promise.value = new Promise((resv, rej) => {
        resolve.value = resv;
        reject.value = rej;
      });

      return promise.value;
    };

    const hide = () => {
      dialog.value.hide();
    };

    const onDialogHide = () => {
      emit('hide');
    };

    const onOKClick = () => {
      if (!props.canOK || !validate.value()) {
        return;
      }

      emit('ok');

      if (timer.value) {
        timeLeft.value = 0;
        clearInterval(timer.value);
      }

      if (resolve.value) {
        if (props.needText) {
          resolve.value(textContent.value);
        } else {
          resolve.value('confirm');
        }

        hide();

        if (typeof props.remove === 'function'){
          props.remove();
        }
      }
    };

    const btnCancel = () => {
      if (!props.canCancel) return;

      emit('cancel');

      if (timer.value) {
        timeLeft.value = 0;
        clearInterval(timer.value);
      }

      if (reject.value) {
        reject.value('cancel');

        if (typeof props.remove === 'function'){
          props.remove();
        }
      }
    };

    const btn_ok = () => {
      if (!validate.value()) {
        return;
      }

      emit('ok');

      if (timer.value) {
        timeLeft.value = 0;
        clearInterval(timer.value);
      }

      if (resolve.value) {
        if (props.needText) {
          resolve.value(textContent.value);
        } else {
          resolve.value('confirm');
        }

        hide();

        if (typeof props.remove === 'function'){
          props.remove();
        }
      }
    };

    expose({
      validate,
      show,
      hide,
    });

    watch(() => props.visible, (v) => {
      if (v) {
        timeout_counter();
        show();
      } else {
        hide();
      }
    });


    const disabled = computed(() => {
      if (typeof props.okDisabled === 'object') {
        return props.okDisabled.value;
      }

      return props.okDisabled;
    });

    const warningMsg = computed(() => {
      // 设置默认warning
      if (!props.showWarning) return '';

      if (!props.warning) {
        return '';
      }
      return props.warning;
    });

    return {
      dialog,
      timeLeft,
      textContent,
      textValid,

      disabled,
      warningMsg,

      validate,

      show,
      hide,
      onDialogHide,
      onOKClick,
      btnCancel,
      btn_ok,
      timeout_counter,
    };
  },
});
</script>

<style scoped rel="stylesheet/scss" lang="scss">
.basic-dialog-card {
  // min-height: 200px;
  min-width: 480px;

  .close-dialog-button {
    position: absolute;
    top: 0;
    right: 0;
    width: 36px;
    z-index: 1;
  }
}

.q-dialog__inner--minimized > div {
  max-width: unset;
}

.dialog-icon {
  position: relative;
  top: 0;
  left: calc(50% - 26px);
  padding: 0;
  width: 52px;
  height: 52px;
  margin-top: 18px;
  margin-bottom: 24px;
}

.title {
  position: relative;
  width: 100%;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin: 10px auto;
}

.cancel-btn {
  margin-right: 20px;
}

.tips {
  display: block;
  position: relative;
  margin-top: 10px;
  font-size: 12px;
  color: gray;
  text-align: center;
}

.warning {
  display: block;
  position: relative;
  font-size: 12px;
  font-weight: 400;
  text-align: center;
  color: red;
}
</style>
