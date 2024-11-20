import { h, getCurrentInstance, } from 'vue';
import { useQuasar } from 'quasar';

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
  setup(props) {
    const { proxy:vm } = getCurrentInstance();
    const $q = useQuasar();

    return () => {
      if (props.src !== undefined && props.src.length > 0) {
        return h(
          'div',
          {
            staticClass: 'q-pdfviewer',
            class: props.contentClass,
            style: props.contentStyle,
          },
          [
            ($q.platform.is.electron || props.type === 'pdfjs')
              // eslint-disable-next-line no-underscore-dangle
              ? vm.__renderIFramePDFJS(h)
              // eslint-disable-next-line no-underscore-dangle
              : vm.__renderObject(h),
          ],
        );
      }

      return ''
    };
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
          src: this.src,
          width: '100%',
          height: '100%',
        },
      );
    },

    // eslint-disable-next-line no-underscore-dangle
    __renderIFramePDFJS(h) {
      return h(
        'iframe',
        {
          staticClass: 'q-pdfviewer__iframe',
          src: `pdfjs${this.version ? `_${this.version}` : ''}/web/viewer.html?file=${encodeURIComponent(this.src)}`,
          width: '100%',
          height: '100%',
        },
      );
    },
  },
};
