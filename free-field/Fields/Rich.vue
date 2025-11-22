<template>
  <div class="free-field-rich row no-wrap">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.Label !== void 0"
    >
      <q-tooltip
        v-if="Field.Description"
        anchor="top right"
      >{{Field.Description}}</q-tooltip>
      {{Field.Label || ''}}
      <span
        v-if="Field.Required"
        class="required-mark"
      >*</span>
    </span>
    <span class="content relative-position fit" :class="isValid ? '' : 'free-field--error'">
      <slot name="warning"></slot>

      <div class="free-field--error-tag" v-if="!isValid">
        <e-icon name="error"></e-icon>
      </div>

      <span
        v-if="Field.ReadOnly"
        class="col readonly"
        ref="readonlyContent"
      ></span>
      <tiny
        v-if="!Field.ReadOnly"
        ref="tiny"
        api-key="wh7g3etkwrso25e0wcpqrx8uvoa51toag3j92mllkajtg1xb"
        tinymce-script-src="/tiny/tiny7.js"
        :init="{
          placeholder: Field.Placeholder || '',
          language_url: '/tiny/langs/zh_cn.js',
          language: 'zh_cn',
          plugins: Field.ReadOnly ? [] : this.plugins,
          menubar: Field.ReadOnly ? [] : this.menubar,
          toolbar: Field.ReadOnly ? '' : this.toolbar.join(' '),
          toolbar_mode: 'wrap',
          importcss_append: true,
          height: 500,
          image_caption: true,
          quickbars_selection_toolbar: Field.ReadOnly
            ? '' : this.quickbars_selection_toolbar.join(' '),
          contextmenu: Field.ReadOnly ? '' : this.contextmenu.join(' '),
          extended_valid_elements:'efield',
          setup: tinySetup,
          default_link_target: (Field && Field.Options && Field.Options.LinkTarget) || '_blank',

          automatic_uploads: (Field && Field.Options && Field.Options.NoUpload) ? false : true,
          images_upload_url: `${ctx.config.baseUrl}/upload`,
          images_reuse_filename: true,
          images_upload_handler,

          skin: isDark ? 'oxide-dark' : 'oxide',
          content_css: isDark ? 'dark' : '',
          promotion: false,
          content_style: 'body[data-mce-placeholder]::before { white-space: pre-wrap; }',

          convert_urls: false,  // 禁止转换 URL
          relative_urls: false, // 禁止使用相对 URL
          remove_script_host: false // 保留主机名
        }"
        initial-value
        model-events
        plugins
        :disabled="Field.ReadOnly"
        toolbar
        value
        v-model="fieldData.value"
        @update:model-value="tinyChanged"
      />
    </span>
  </div>
</template>

<script>
import { defineComponent, watchEffect, ref, getCurrentInstance } from 'vue';
import { useQuasar } from 'quasar';
import tiny from '@tinymce/tinymce-vue';
import { fileSizeStrToNumber } from '../composible/useFileSizeUtils';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';

export default defineComponent({
  name: 'InputFieldRich',
  fieldInfo: {
    Category: 'Advanced',
    Label: '所见即所得',
    Value: 'Rich',
    Description: '',
    Extra: [
      {
        Type: 'Number',
        Label: '最大长度',
        Name: 'Options.MaxLength',
        Default: '1000',
      },
      {
        Type: 'Number',
        Label: '最大内容大小',
        Name: 'Options.MaxSize',
        Default: '5m',
      },
      {
        Type: 'Select',
        Name: 'Options.LinkTarget',
        Label: '默认链接打开方式',
        Default: '_blank',
        Options: [
          {
            Label: '新窗口',
            Value: '_blank',
          },
          {
            Label: '当前窗口',
            Value: '_self',
          },
        ],
      },
      {
        Type: 'Boolean',
        Name: 'Options.NoUpload',
        Label: '禁止上传',
        Default: false,
      },
    ],
  },
  components: {
    tiny,
  },
  emits: ['input'],
  props: {
    ...freeFieldProps,
    enableField: { type: Boolean, default: false },
  },
  setup(props, { expose, emit })  {
    const { proxy:vm } = getCurrentInstance();
    const $q = useQuasar();

    if (!props.Field) return {};

    const { fieldData, setFieldData } = useFreeField(props);

    const readonlyContent = ref(null);
    const tiny = ref(null);

    // TODO: 设置默认warning信息不生效
    if (props.Field.Warning) {
      Object.setValue(props.Field, 'Warning', `可嵌入图片、视频、超级链接。内容不可超过${(props.Field.Options?.MaxLength) || 1000}字，内容总大小不可超过${(props.Field.Options?.MaxSize) || '5m'}。较大图片或视频请使用超链接！`);
    }

    const isValid = ref(true);
    const plugins = [
        // 'print',
        // 'preview',
        // 'paste',
        // 'powerpaste',
        // 'importcss',
        // 'searchreplace',
        // 'autolink',
        // 'autosave',
        // 'save',
        // 'directionality',
        'code',
        // 'visualblocks',
        // 'visualchars',
        'fullscreen',
        'image',
        'link',
        'media',
        // 'template',
        // 'codesample',
        'table',
        // 'charmap',
        // 'hr',
        // 'pagebreak',
        // 'nonbreaking',
        // 'anchor',
        // 'toc',
        // 'insertdatetime',
        // 'advlist',
        'lists',
        'wordcount',
        // 'imagetools',
        // 'textpattern',
        // 'noneditable',
        // 'help',
        // 'charmap',
        'quickbars',
        'emoticons',
      ];
    const menubar = ['insert', 'format', 'table'];
    const toolbar = [
        'undo',
        'redo',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        // 'fontselect',
        'fontsizeselect',
        'formatselect',
        '|',
        'alignleft',
        'aligncenter',
        'alignright',
        'alignjustify',
        'indent2em',
        '|',
        'numlist',
        'bullist',
        '|',
        'charmap',
        'emoticons',
        '|',
        'fullscreen',
        '|',
        'insertfile',
        'image',
        'media',
        'link',
        '|',
        'code',
        'insertFieldButton',
      ];
    const quickbars_selection_toolbar = [
        'bold',
        'italic',
        '|',
        'quicklink',
        'h2',
        'h3',
        'blockquote',
        'quickimage',
        'quicktable',
        '|',
        'insertFieldButton',
      ];
    const contextmenu = ['link', 'image', 'table'];

    if (props.Field.ReadOnly) {
      watchEffect(() => {
        if (readonlyContent.value) {
          readonlyContent.value.innerHTML = fieldData.value;
        }
      });
    }

    const validate = () => {
      let isVal = true;
      if (tiny.value) {
        if (props.Field.Required) isVal = !!fieldData.value;

        const rules = Array.isArray(typeof props.Field.Rules)
          ? props.Field.Rules : [props.Field.Rules];

        for (let i = 0; i < rules.length; i += 1) {
          const r = rules[i];

          if (typeof r === 'function') {
            isVal = isVal && r(fieldData.value);
          }
        }
      }

      isValid.value = isVal;

      return isVal;
    };

    const tinySetup = (editor) => {
      // add button for indent 2ems
      editor.on('init', () => {
        editor.formatter.register('indent2em', {
          block: 'p',
          styles: { 'text-indent': '2em' }
        });
      })

      editor.ui.registry.addToggleButton('indent2em', {
        tooltip: '首行缩进两个字宽度',
        icon: 'indent',
        onAction: function () {
          editor.execCommand('mceToggleFormat', false, 'indent2em');
        },
        onSetup: function (api) {
          editor.formatter.formatChanged('indent2em', function (state) {
            api.setActive(state);
          });
        }
      });

      // add button for insert field content
      if (props.enableField) {
        editor.ui.registry.addButton('insertFieldButton', {
          text: '数据字段',
          tooltip: '插入数据字段',
          onAction() {
            const selectedText = editor.selection.getContent({
              format: 'html',
            });
            editor.insertContent(`<efield>{${selectedText}}</efield>`);
          },
        });
      }

      if (props.Field.Options?.MaxLength) {
        editor.on('input', () => {
          const ctLen = editor.plugins.wordcount.body.getWordCount();

          if (ctLen > props.Field.Options.MaxLength) {
            // 如果超过了限制，则撤销最后的更改
            // TODO: 撤销不是最好的处理方式，应该是从最后输入的内容开始删除
            editor.undoManager.undo();
          }
        });
      }
      if (props.Field.Options?.MaxSize) {
        const maxSize = fileSizeStrToNumber(props.Field.Options.MaxSize);

        editor.on('input', () => {
          if (editor.getContent({ format: 'html' }).length > maxSize) {
            // 如果超过了限制，则撤销最后的更改
            // TODO: 撤销不是最好的处理方式，应该是从最后输入的内容开始删除
            editor.undoManager.undo();
          }
        });
      }
    };

    const tinyChanged = (v) => {
      validate();
      setFieldData(v, emit);
    };

    expose({
      validate,
    })

    return {
      isValid,
      fieldData,
      readonlyContent,
      tiny,
      tinySetup,
      tinyChanged,

      plugins,
      menubar,
      toolbar,
      quickbars_selection_toolbar,
      contextmenu,

      isDark: $q.dark.isActive,

      images_upload_handler: (
        blobInfo,
      ) => new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        vm.postRequest('/upload', formData, {
          __ignoreDecycle: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then((res) => {
          if (res && res.data && res.data.id) {
            resolve(`${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}${vm.ctx.config.imageUrlBase}${res.data.id}${props.Field.Options?.UploadedImageUrlArgs || ''}`);
          } else {
            reject({
              message: '上传失败',
              remove: true,
            });
          }
        }).catch((err) => {
          reject({
            message: err,
            remove: true,
          });
        });
      }),
    };
  },
});
</script>

<style lang="sass">
// .tox.tox-tinymce
//   z-index: 2000 !important
.tox-tinymce-aux
  z-index: 6001 !important
  .tox-menu
    z-index: 6002 !important

.tox-fullscreen
  z-index: 6000 !important
  .tox-tinymce-aux
    z-index: 6001 !important
    .tox-tiered-menu
      z-index: 6002 !important
      .tox-menu
        z-index: 6002 !important
// .tox-tinymce-aux
//   z-index: 6001 !important

.free-field-rich
  .tox-tinymce
    width: auto
    min-width: 0
    max-width: 100%
    flex: 10000 1 0%

.tox-notifications-container,.tox-statusbar__branding
  display: none
</style>
