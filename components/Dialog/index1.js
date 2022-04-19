import {createApp} from 'vue';
import BasicDialog from './BasicDialog.vue';

let _i18n = null;

export function setI18n (i18n) {
  _i18n = i18n
}

const MsgDialog = {};
MsgDialog.install = (app) => {
  // const MessageDialogInstance = app.extend(BasicDialog);
  // const MessageDialogInstance = createApp(BasicDialog);

  let MsgDialogInstance;
  const init = () => {
    // app.config.globalProperties._i18n = _i18n;

    // MsgDialogInstance = new MessageDialogInstance();
    MsgDialogInstance = createApp(BasicDialog);
    MsgDialogInstance = MsgDialogInstance.mount('#eis-dialog');
    // document.body.appendChild(msgBoxEl);
  };

  app.config.globalProperties.$MsgDialog = (options) => {
    if (!MsgDialogInstance) {
      init();
    }

    if (typeof options === 'string') {
      MsgDialogInstance.content = options;
    } else if (typeof options === 'object') {
      Object.assign(MsgDialogInstance.$props, options);
    }

    // return MsgDialogInstance.show_msg_box()
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
