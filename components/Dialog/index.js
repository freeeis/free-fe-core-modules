import { createApp } from 'vue';
import Dialog from './BasicDialog.vue'

const MsgDialog = {};
MsgDialog.install = (app) => {
  let MsgDialogInstance;
  const init = (opts) => {
    const dialogApp = createApp(Dialog, {
      ...opts, modelValue: true,
      remove: () => {
        dialogApp.unmount();
      }
    });

    dialogApp.config.globalProperties = app.config.globalProperties;

    const { ...appContext } = app._context;
    Object.assign(dialogApp._context, appContext);

    MsgDialogInstance = dialogApp.mount('#free-dialog');
  };

  app.config.globalProperties.$MsgDialog = (options) => {
    const opts = {};

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
