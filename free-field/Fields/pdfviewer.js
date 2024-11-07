import { useModelToggleProps, useModelToggleEmits } from 'quasar/src/composables/private.use-model-toggle/use-model-toggle.js';

export default {
  name: 'QPdfviewer',

  props: {
    ...useModelToggleProps,
    version: { type: String, default: '' },
    src: String,
    type: {
      type: String,
      default: 'html5',
      validator: (v) => ['html5', 'pdfjs'].indexOf(v) !== -1,
    },
    errorString: {
      type: String,
      default:
        'This browser does not support PDFs. Download the PDF to view it:',
    },
    contentStyle: [String, Object, Array],
    contentClass: [String, Object, Array],
    innerContentStyle: [String, Object, Array],
    innerContentClass: [String, Object, Array],
  },

  emits: [
    ...useModelToggleEmits,
  ],
  data() {
    return {
      hashId: `q-pdfviewer-${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      height: '1200',
    };
  },
  mounted() {
    window.addEventListener('message', (event) => {
      this.height = event.data;
    });
  },
  methods: {
    // eslint-disable-next-line no-underscore-dangle
    __renderObject(h) {
      return h(
        'object',
        {
          class: this.innerContentClass,
          style: this.innerContentStyle,
          attrs: {
            id: this.hashId,
            data: this.src,
            type: 'application/pdf',
            width: '100%',
            height: '100%',
          },
          on: {
            ...this.$listeners,
          },
        },
        [
          // browser object not supported, try iframe
          // eslint-disable-next-line no-underscore-dangle
          this.__renderIFrame(h),
        ],
      );
    },

    // eslint-disable-next-line no-underscore-dangle
    __renderIFrame(h) {
      return h(
        'iframe',
        {
          staticClass: 'q-pdfviewer__iframe',
          attrs: {
            src: this.src,
            width: '100%',
            height: '100%',
          },
        },
      );
    },

    // eslint-disable-next-line no-underscore-dangle
    __renderIFramePDFJS(h) {
      return h(
        'iframe',
        {
          staticClass: 'q-pdfviewer__iframe',
          attrs: {
            src: `pdfjs${this.version ? `_${this.version}` : ''}/web/viewer.html?file=${encodeURIComponent(this.src)}`,
            width: '100%',
            height: '100%',
          },
        },
      );
    },
  },

  render(h) {
    if (this.value === true && this.src !== undefined && this.src.length > 0) {
      return h(
        'div',
        {
          staticClass: 'q-pdfviewer',
          class: this.contentClass,
          style: this.contentStyle,
          attrs: {
          },
        },
        [
          this.$q.platform.is.electron || this.type === 'pdfjs'
            // eslint-disable-next-line no-underscore-dangle
            ? this.__renderIFramePDFJS(h)
            // eslint-disable-next-line no-underscore-dangle
            : this.__renderObject(h),
        ],
      );
    }
    return '';
  },
};
