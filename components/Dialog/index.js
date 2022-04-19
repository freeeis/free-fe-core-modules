import { createApp } from 'vue'
import BasicDialog from './BasicDialog.vue';

let $inst
// 创建挂载实例
let createMount = (opts) => {
  const app = createApp(BasicDialog, {
    ...opts, modelValue: true,
    remove () {
      app.unmount(mountNode)
      document.body.removeChild(mountNode)
    }
  })
  return app.mount('#eis-dialog')
}

function MsgDialog (options = {}) {
  if (typeof options === 'string') {
    options = {content: options};
  }

  $inst = createMount(options)

  return $inst.show()
    .then((val) => {
      return Promise.resolve(val);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

MsgDialog.install = (app) => {
  app.config.globalProperties.$MsgDialog = MsgDialog;
  // app.provide('MsgDialog', MsgDialog)
}

export default MsgDialog;
