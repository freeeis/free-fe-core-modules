import {
  defineComponent,
  getCurrentInstance,
  h,
  ref,
  shallowRef,
  watchEffect,
  computed,
  onMounted,
  nextTick,
  isRef,
} from "vue";
import { freeFieldProps } from "./useFreeField";
import { useFormValidator } from '../../composible/useFormValidator';


export default defineComponent({
  name: "FreeFieldWrapper",
  props: {
    ...freeFieldProps,
    noExtra: { type: Boolean, default: false },
    noWarning: { type: Boolean, default: false },
    noTips: { type: Boolean, default: false },
  },
  emits: ['input'],
  setup(props, { slots, emit, expose, attrs }) {
    if (!props.Field) return {};

    const { proxy: vm } = getCurrentInstance();

    const localField = computed(() => {
      const lField = { ...props.Field };
      lField.Rules = lField.Rules || [];
      for (let i = 0; i < lField.Rules.length; i += 1) {
        const rule = lField.Rules[i];

        if (
          typeof rule === "string" &&
          vm.ctx.validators[rule] &&
          vm.ctx.validators[rule].validator
        ) {
          lField.Rules[i] = (val) =>
            vm.ctx.validators[rule].validator(isRef(val) ? val.value : val);
        }
      }

      if (lField.Required) {
        lField.Rules.push(
          (val) => {
            const pVal = isRef(val) ? val.value : val;
            return typeof pVal !== "undefined" && pVal !== "";
          }
        );
      }

      return lField;
    });

    const dashedName = (props.Field.Name || "").replace(/\./g, "-");
    const hasError = ref(false);

    // TODO: any other solution to replace the eval??
    const evalFunc = (cond, pName = "data") => {
      const funcStr = `
      (${pName}) => {
        return ${cond};
      }
      `;

      try {
        // eslint-disable-next-line no-eval
        return eval(funcStr);
      } catch (ex) {
        return undefined;
      }
    };

    const shouldHide = computed(() => {
      // show when
      if (props.Field.Info && props.Field.Info.ShowWhen) {
        const theFunc = evalFunc(props.Field.Info.ShowWhen);
        if (typeof theFunc !== "function") {
          return true;
        }
        const condResult = theFunc(props.values);
        if (!condResult) return true;
      }

      // hide (when)
      if (
        props.Field.Hidden &&
        props.Field.Info &&
        props.Field.Info.HideWhenUndefined
      ) {
        const checkField =
          props.Field.Info.HideWhenUndefinedField || props.Field.Name;
        if (checkField) {
          const fList = checkField.split(",");
          for (let i = 0; i < fList.length; i += 1) {
            const fl = fList[i];

            const flv = Object.nestValue(vm.data, fl.trim());
            if (typeof flv === "undefined") return true;

            if (props.Field.Info.IncludeEmptyObject) {
              return !Object.hasValue(flv);
            }
          }
          return false;
        }
      }

      return props.Field.Hidden;
    });

    let realComponent = shallowRef(null);

    watchEffect(() => {
      const fComponents = vm.ctx.FieldComponents || {};
      let field;

      // for some specified types
      if (props.Field.Component) {
        field = props.Field.Component;
        // TODO: make select and radio as two diff components
        // } else if (props.Field.Type === 'Select' && props.Field.AsRadio) {
        //   field = fComponents.RadioList;
      } else {
        if (typeof props.Field.Type === "undefined") {
          field = fComponents.String;
        } else {
          field = fComponents[props.Field.Type] || props.Field.Type;
        }
      }

      realComponent.value = field;
    });

    if (props.Field && props.Field.Info && props.Field.Info.KeepChanged) {
      onMounted(() => {
        nextTick(() => {
          props.$emit("input", props.Field);
        });
      });
    }

    const wrapperClass = `free-field-wrapper ${
      props.Field.Label && props.Field.Label.trim().length
        ? "with-label"
        : "without-label"
    } ${props.Field.Label ? "free-field-wrapper-" + props.Field.Label : ""} ${
      props.Field.Name ? "free-field-wrapper-" + dashedName : ""
    } ${props.Field.Info?.Classes || ""}`;

    const warningSlot = (!props.noWarning && localField.value.Warning)
      && h('span', {
        class: 'input-field-warning no-wrap',
      },
      [
        h('span', { class: 'input-field-warning-icon' }),
        h('span', { class: 'input-field-warning-icon-sign-top' }),
        h('span', { class: 'input-field-warning-icon-sign-dot' }),
        h('span', { class: 'input-field-warning-text ellipsis' }, localField.value.Warning),
      ]
    );


    const compEmits = ref({});
    watchEffect(() => {
      (realComponent?.value?.emits || []).forEach((em) => {
        if (!em || em === 'input') return;
  
        const captEm = `${em[0].toUpperCase()}${em.substring(1)}`;
        compEmits.value[`on${captEm}`] = (...args) => {
          // should not emit event directly as we were not inlucde these events in the emits list
          // but we could get any matched handller from the parent component and then call that
          // handller directly
          // emit(em, ...args);
          const outerHandller = attrs[`on${captEm}`];
          if (typeof outerHandller === 'function') {
            outerHandller(...args);
          }
        };
      });
    })

    const readComp = computed(() => realComponent.value && h(
      realComponent.value,
      {
        Field: localField.value,
        values: props.values,
        style: shouldHide.value ? "display:none;" : "",
        class: [
          props.Field.ReadOnly ? "free-field--readonly" : "",
          !shouldHide.value && hasError.value ? "hasError" : "",
        ],
        onInput: () => {
          emit("input", props.Field);
        },
        ...compEmits.value,
      },
      {
        ...slots,
        warning: slots.warning ? slots.warning : () => warningSlot,
      }
    ));
    
    // const emitsRef = computed(() => realComponent?.value?.emits);

    const {
      validate,
    } = useFormValidator(readComp);

    expose ({
      // emits: emitsRef.value,
      validate: () => validate.value(props.Field.Name),
    })

    return realComponent.value ? () => h(
      "div",
      {
        class: wrapperClass,
      },
      [
        readComp.value,
      ]
    ) : () => null;
  },
});
