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

import '../style.scss';

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
      const lField = Object.clone(props.Field);

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
            return !!pVal;
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
        return eval(funcStr);
      } catch (ex) {
        console.error(ex)
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
          emit("input", props.Field);
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
        class: 'free-field-warning no-wrap',
      },
      [
        h('span', { class: 'free-field-warning-icon' }),
        h('span', { class: 'free-field-warning-icon-sign-top' }),
        h('span', { class: 'free-field-warning-icon-sign-dot' }),
        h('span', { class: 'free-field-warning-text ellipsis' }, localField.value.Warning),
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

    const realComp = computed(() => realComponent.value && h(
      realComponent.value,
      {
        Field: localField.value,
        values: props.values,
        style: shouldHide.value ? "display:none;" : "",
        class: [
          props.Field.ReadOnly ? "free-field--readonly" : "",
          !shouldHide.value && hasError.value ? "hasError" : "",
        ],
        /**
         *
         * @param {any} _ value of the changed field
         * @param {Field} fld the changed field (optional)
         */
        onInput: (_, fld) => {
          emit("input", fld || props.Field);
        },
        ...compEmits.value,
        ...localField.value.attrs,
      },
      {
        ...slots,
        warning: slots.warning ? slots.warning : () => warningSlot,
      }
    ));

    // const emitsRef = computed(() => realComponent?.value?.emits);

    const {
      validate,
    } = useFormValidator(realComp);

    expose ({
      // emits: emitsRef.value,
      validate: () => validate.value(props.Field.Name),
    })

    const fieldTip = (tip) => {
      if (!tip || !tip.Text) return '';
      if (!tip.Links || !Array.isArray(tip.Links) || tip.Links.length <= 0) {
        return [{ Text: tip.Text }];
      }

      // process tip with links
      let linkPos = [];
      tip.Links.forEach((tl) => {
        if (!tl || !tl.Text) return;

        const start = tip.Text.indexOf(tl.Text);
        if (start >= 0) {
          linkPos.push({
            ...tl,
            start,
            end: start + tl.Text.length,
          });
        }
      });

      const textSplit = [];
      let start = 0;
      linkPos = linkPos.sort((a, b) => a.start - b.start);
      for (let i = 0; i < linkPos.length; i += 1) {
        const lp = linkPos[i];

        const beforeText = tip.Text.substr(start, lp.start - start);
        if (beforeText) {
          textSplit.push({ Text: beforeText });
        }

        textSplit.push({
          ...lp,
          Text: tip.Text.substr(lp.start, lp.end - lp.start),
          Link:
            !!lp.File && lp.isFile
              ? vm.$filter('serverDocument', lp.File)
              : lp.Link,
        });

        start = lp.end;
      }

      const afterText = tip.Text.substr(start);
      if (afterText) {
        textSplit.push({
          Text: afterText,
        });
      }

      if (textSplit.length > 0) return textSplit;

      return [{ Text: tip.Text }];
    };

    const tipsElem = !shouldHide.value && !props.noTips && (localField.value.Tips?.length > 0) && h(
      "div",
      {
        class: "free-field-tips",
      },
      [
        h("span", {
          class: "free-field-tips-prefix",
        }),
        h("span", {
          class: "tips-list",
        },
        [
          localField.value.Tips.map((tip) => h("span", {
            class: "free-field-tips-tip",
          },
          [
            h("span", {
              class: "free-field-tips-tip-prefix",
            }),
            fieldTip(tip).map(
              (t) => h("span", null, [
                t.Link ? h("span", {
                  class: "tip-link",
                  }, [
                    h("span", {
                      class: "tip-link-prefix",
                    }),
                    t.File ? h("a", {
                      href: t.Link,
                      target: t.target || '_blank',
                      download: `${t.Text}${t.File && t.File.substr(t.File.lastIndexOf('.'))}`,
                      }, t.Text) : h("a", {
                        href: t.Link,
                        target: t.target || '_blank',
                        }, t.Text),
                    h("span", {
                      class: "tip-link-postfix",
                    }),
                  ]) : (t.File ? h("span", {
                    class: "tip-text",
                    }, [
                      h("span", {
                        class: "tip-link-prefix",
                      }),
                      t.File,
                      h("span", {
                        class: "tip-link-postfix",
                      }),
                    ]) : h("span", {
                      class: "tip-text",
                      }, t.Text))
              ])
            ),
            h("span", {
              class: "free-field-tips-tip-postfix",
            }),
          ]
          )),
        ]),
        h('span', {
          class: 'free-field-tips-postfix',
        })
      ]
    );


    return realComponent.value ? () => h(
      "div",
      {
        class: wrapperClass,
        style: props.Field.Info?.Style || '',
      },
      [
        realComp.value,
        tipsElem,
      ]
    ) : () => null;
  },
});
