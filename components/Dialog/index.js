import { createApp, defineAsyncComponent, getCurrentInstance } from 'vue';
import Dialog from './BasicDialog.vue'

const MsgDialog = {};
MsgDialog.install = (app) => {
  let MsgDialogInstance;
  const init = (opts) => {
    // const app = createApp(defineAsyncComponent(() => import('./BasicDialog.vue')));
    const app = createApp(Dialog, { ...opts, modelValue: true });
    MsgDialogInstance = app.mount('#free-dialog');
  };

  app.config.globalProperties.$MsgDialog = (options) => {
    const opts = {};

    console.error(getCurrentInstance())

    if (typeof options === 'string') {
      opts.content = options;
    } else if (typeof options === 'object') {
      Object.assign(opts, options);
    }

    if (!MsgDialogInstance) {
      init(opts);
    }

    return MsgDialogInstance.show()
      .then((val) => {
        MsgDialogInstance = null;
        return Promise.resolve(val);
      })
      .catch((err) => {
        MsgDialogInstance = null;
        return Promise.reject(err);
      });
  };
};

export default MsgDialog;
