<template>
  <div class="input-field-rich row no-wrap">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="typeof Field.Label !== 'undefined'"
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
    <span class="content relative-position fit" :class="isValid ? '' : 'input-field--error'">
      <slot name="warning"></slot>

      <div class="input-field--error-tag" v-if="!isValid">
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
        tinymce-script-src="tiny/tiny_bk.js"
        :init="{
        language_url: 'tiny/langs/zh_cn.js',
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
      }"
        initial-value
        model-events
        plugins
        :disabled="Field.ReadOnly"
        toolbar
        value
        v-model="fieldData"
        @onChange="validate();$emit('input')"
      />
    </span>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';
import tiny from '@tinymce/tinymce-vue';

function fileSizeStrToNumber(s) {
  if (!s) return undefined;

  const sizeMatch = s.match(/^([0-9]*)(k|m|g*)(b*)/);

  if (sizeMatch) {
    // eslint-disable-next-line no-unused-vars
    // const [tmp, num, unit] = sizeMatch;
    const num = sizeMatch[1];
    const unit = sizeMatch[2];
    if (!num || !Number(num)) return '';

    let multi = 1;
    switch (unit) {
      case 'k':
        multi = 1024;
        break;
      case 'm':
        multi = 1024 * 1024;
        break;
      case 'g':
        multi = 1024 * 1024 * 1024;
        break;
      default:
        multi = 1024;
        break;
    }

    return Number(num) * multi;
  }

  return undefined;
}

export default defineComponent({
  name: 'InputFieldRich',
  mixins: [mixins.InputFieldMixin],
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
    ],
  },
  components: {
    tiny,
  },
  props: {
    enableField: { type: Boolean, default: false },
  },
  data() {
    return {
      isValid: true,
      plugins: [
        'print',
        // 'preview',
        'paste',
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
        'hr',
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
      ],
      menubar: ['insert', 'format', 'table'],
      toolbar: [
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
      ],
      quickbars_selection_toolbar: [
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
      ],
      contextmenu: ['link', 'image', 'table'],
    };
  },
  watch: {
    fieldData() {
      if (this.$refs.readonlyContent && this.Field.ReadOnly && this.fieldData) {
        this.$refs.readonlyContent.innerHTML = this.fieldData;
      }
    },
  },
  created() {
    if (this.$refs.readonlyContent && this.Field.ReadOnly) {
      this.$refs.readonlyContent.innerHTML = this.fieldData;
    }

    this.Field.Warning = this.Field.Warning
    || `可嵌入图片、视频、超级链接。内容不可超过${(this.Field.Options && this.Field.Options.MaxLength) || 1000}字，内容总大小不可超过${(this.Field.Options && this.Field.Options.MaxSize) || '5m'}。较大图片或视频请使用超链接！`;
  },
  methods: {
    validate() {
      let isValid = true;
      if (this.$refs.tiny) {
        if (this.Field.Required) isValid = !!this.fieldData;

        const rules = Array.isArray(typeof this.Field.Rules)
          ? this.Field.Rules : [this.Field.Rules];

        for (let i = 0; i < rules.length; i += 1) {
          const r = rules[i];

          if (typeof r === 'function') {
            isValid = isValid && r(this.fieldData);
          }
        }
      }

      this.isValid = isValid;

      return isValid;
    },
    tinySetup(editor) {
      if (this.enableField) {
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

      if (this.Field && this.Field.Options) {
        if (this.Field.Options.MaxLength) {
          editor.on('keydown', (e) => {
            const allowedKeys = [8, 37, 38, 39, 40, 46];
            if (allowedKeys.indexOf(e.keyCode) >= 0) return true;

            const selectedText = editor.selection.getContent({
              format: 'text',
            });

            if (selectedText.length <= 0
            && editor.getContent({ format: 'text' }).length >= this.Field.Options.MaxLength) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }

            return true;
          });
        }
        if (this.Field.Options.MaxSize) {
          const maxSize = fileSizeStrToNumber(this.Field.Options.MaxSize);

          editor.on('keydown', (e) => {
            const allowedKeys = [8, 37, 38, 39, 40, 46];
            if (allowedKeys.indexOf(e.keyCode) >= 0) return true;

            const selectedText = editor.selection.getContent({
              format: 'text',
            });

            if (selectedText.length <= 0
            && editor.getContent({ format: 'html' }).length >= maxSize) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }

            return true;
          });
        }
      }
    },
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

.input-field-rich
  .tox-statusbar__branding
    display: none
  .tox-tinymce
    width: auto
    min-width: 0
    max-width: 100%
    flex: 10000 1 0%

.tox-notifications-container,.tox-statusbar__branding
  display: none
</style>
