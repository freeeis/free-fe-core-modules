import { createApp } from 'vue';
import dialog from './BasicDialog.vue';

// 创建挂载实例
let createMount = (opts) => {
  const app = createApp(dialog, {
    ...opts, modelValue: true,
    // remove () {
    //   app.unmount(mountNode)
    //   document.body.removeChild(mountNode)
    // }
  })

  return app.mount('#free-dialog')
}

function MsgDialog (options = {}) {
  if (typeof options === 'string') {
    options = {content: options};
  }

  const $inst = createMount(options)

  console.error($inst)
  if (!$inst) {
    console.error($inst)
    return;
  }

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
