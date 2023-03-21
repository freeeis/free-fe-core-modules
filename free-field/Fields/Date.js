import { ref, defineComponent, getCurrentInstance, h, computed } from 'vue';
import { QInput, QIcon, QPopupProxy, QDate } from 'quasar';
import { useFreeField, freeFieldProps, useFreeFieldMethods } from '../composible/useFreeField';
import freeFieldLabel from '../composible/freeFieldLabel';
import { useFormValidator} from '../../composible/useFormValidator';

export default defineComponent({
  name: 'InputFieldDate',
  fieldInfo: {
    Category: 'DateTime',
    Label: '日期',
    Value: 'Date',
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
  methods: {
    ...useFreeFieldMethods,
  },
  setup(props, { emit, slots, expose }){
    if (!props.Field) return {};

    const { proxy: vm } = getCurrentInstance();

    const { fieldData, setFieldData } = useFreeField(props);

    const before = (props.Field.Label !== void 0) ? () => h(freeFieldLabel, {
      Field: props.Field,
    }) : () => h('div', {
      class: 'field-label-empty'
    });

    const dateOptions = computed(() => {
      if (props.Field.Options && (typeof props.Field.Options === 'function' || Array.isArray(props.Field.Options))) return props.Field.Options;

      let minDate = '1900/01/01';
      let maxDate = '2100/12/31';

      if (props.Field.MinValue) {
        minDate = props.Field.MinValue;
      }

      if (props.Field.MaxValue === 'now') {
        maxDate = new Date().toLocaleDateString();
      } else if (props.Field.MaxValue) {
        maxDate = props.Field.MaxValue;
      }

      return (date) => date >= minDate && date <= maxDate;
    });

    const locale = vm.ctx.config.locales.find(
      (l) => l.locale === (vm.ctx.config.locale || vm.ctx.config.defaultLocale),
    )?.calendar;

    const localDate = computed(() => vm.$filter('normalDate', fieldData.value));

    const showPopup = ref(false);

    const DateNode = computed(() => h(QInput, {
      hideBottomSpace: true,
      readonly: props.Field?.ReadOnly,

      style: props.Field.Info?.Style,

      rules: props.Field.Rules,

      modelValue: localDate.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    }, {
      default: () => h(QPopupProxy, {
        transitionShow: "scale",
        transitionHide: "scale",
        modelValue: showPopup.value,
      },() => h('span', {
        class: 'row'
      }, [
        h(QDate, {
          modelValue: localDate.value,

          options: dateOptions.value,
          todayTtn: true,
          mask: 'YYYY-MM-DD',
          locale,

          'onUpdate:modelValue': (v) => {
            setFieldData(v, emit);

            // TODO: not working, should close the popup but not
            showPopup.value = false;
          },
        })
      ])),
      before,
      append: () => h(QIcon, {
        class: 'cursor-pointer',
        name: 'event'
      }),
    }));

    const {
      validate,
    } = useFormValidator(DateNode);
    expose({
      validate,
    })

    return () => h('div', {
      class: 'simple-field input-field-date row items-center no-wrap',
    }, [
      props.Field.ReadOnly ? readonlyNode() : DateNode.value,
      slots.warning && slots.warning(),
    ]);
  },
});
