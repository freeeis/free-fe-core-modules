import { ref, defineComponent, getCurrentInstance, h, computed, watch, watchEffect } from 'vue';
import { QInput, QIcon, QPopupProxy, QDate } from 'quasar';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import freeFieldLabel from '../composible/freeFieldLabel';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldDateRange',
  fieldInfo: {
    Category: 'DateTime',
    Label: '日期范围',
    Value: 'DateRange',
    Extra: [
      {
        Type: 'String',
        Label: '最小值',
        Name: 'MinValue',
      },
      {
        Type: 'String',
        Label: '最大值',
        Name: 'MaxValue',
      },
      {
        Type: 'Boolean',
        Label: '最大至“现在”',
        Name: 'Info.TillNow',
      },
      {
        Type: 'Boolean',
        Label: '最小从“现在”',
        Name: 'Info.FromNow',
      },
    ],
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { emit, slots, expose }){
    if (!props.Field) return {};

    const { proxy: vm } = getCurrentInstance();

    const { fieldData, setFieldData, inputControlSettings } = useFreeField(props);

    const updateFieldDate = () => {
      setFieldData([min.value, max.value].join(props.Field.Separator || '~'), emit);
    };

    const min = ref('');
    const max = ref('');

    watch(min, () => updateFieldDate());
    watch(max, () => updateFieldDate());

    watchEffect(() => {
      const yl = (fieldData.value || '').split(props.Field.Separator || '~');
      min.value = yl[0] && yl[0].trim();
      max.value = yl[1] && yl[1].trim();
    });

    const readonlyNode = () => h(ReadonlyContent, {
      Field: props.Field,
      Content: fieldData.value,
    });

    const before = (props.Field.Label !== void 0) ? () => h(freeFieldLabel, {
      Field: props.Field,
    }) : undefined;

    const minDateOptions = computed(() => {
      let minDate = '1900/01/01';
      let maxDate = '2100/12/31';

      if (props.Field.MinValue) {
        minDate = props.Field.MinValue.replace(/-/g, '/');
      }

      if (props.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (props.Field.MaxValue) {
        maxDate = props.Field.MaxValue.replace(/-/g, '/');
      }

      if (max.value && max.value.replace(/-/g, '/') < maxDate) return (date) => date >= minDate && date < max.value.replace(/-/g, '/');

      return (date) => date >= minDate && date <= maxDate;
    });

    const maxDateOptions = computed(() => {
      let minDate = '1900/01/01';
      let maxDate = '2100/12/31';

      if (props.Field.MinValue) {
        minDate = props.Field.MinValue.replace(/-/g, '/');
      }

      if (props.Field.TillNow) {
        maxDate = new Date().toLocaleDateString();
      } else if (props.Field.MaxValue) {
        maxDate = props.Field.MaxValue.replace(/-/g, '/');
      }

      if (min.value && min.value.replace(/-/g, '/') > minDate) {
        return (date) => date > min.value.replace(/-/g, '/') && date <= maxDate;
      }
      return (date) => date >= minDate && date <= maxDate;
    });

    const locale = vm.ctx.config.locales.find(
      (l) => l.locale === (vm.ctx.config.locale || vm.ctx.config.defaultLocale),
    )?.calendar;

    const showMinPopup = ref(false);
    const showMaxPopup = ref(false);


    const minDateNode = computed(() => h(QInput, {
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,

      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      ...inputControlSettings.value,

      modelValue: min.value,
      'onUpdate:modelValue': (v) => {
        min.value = v;
        emit('input', v);
      },
    }, {
      default: () => h(QPopupProxy, {
        transitionShow: "scale",
        transitionHide: "scale",
        modelValue: showMinPopup.value,
      },() => h('span', {
        class: 'row'
      }, [
        h(QDate, {
          modelValue: min.value,

          options: minDateOptions.value,
          todayTtn: true,
          mask: 'YYYY-MM-DD',
          locale,

          'onUpdate:modelValue': (v) => {
            min.value = v;

            // TODO: not working, should close the popup but not
            showMinPopup.value = false;
            emit('input', v);
          },
        })
      ])),
      before,
      append: () => h(QIcon, {
        class: 'cursor-pointer',
        name: 'event'
      }),
    }));

    const maxDateNode = computed(() => h(QInput, {
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,

      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      ...inputControlSettings.value,

      modelValue: max.value,
      'onUpdate:modelValue': (v) => {
        max.value = v;
        emit('input', v);
      },
    }, {
      default: () => h(QPopupProxy, {
        transitionShow: "scale",
        transitionHide: "scale",
        modelValue: showMaxPopup.value,
      },() => h('span', {
        class: 'row'
      }, [
        h(QDate, {
          modelValue: max.value,

          options: maxDateOptions.value,
          todayTtn: true,
          mask: 'YYYY-MM-DD',
          locale,

          'onUpdate:modelValue': (v) => {
            max.value = v;

            // TODO: not working, should close the popup but not
            showMaxPopup.value = false;
            emit('input', v);
          },
        })
      ])),
      append: () => h(QIcon, {
        class: 'cursor-pointer',
        name: 'event'
      }),
    }));

    const { validate } = useFormValidator(minDateNode, maxDateNode);
    expose({
      validate,
    })

    return () => h('div', {
      class: 'simple-field free-field-date row items-center no-wrap',
    }, [
      props.Field.ReadOnly ? readonlyNode() : h('div', {
        class: 'row items-center no-wrap'
      }, [
        minDateNode.value,
        h('span', {
          class: 'free-field-range-separator'
        },props.Field.Separator || '~'),
        maxDateNode.value,
      ]),
      slots.warning && slots.warning(),
    ]);
  },
});
