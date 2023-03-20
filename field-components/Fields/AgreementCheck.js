import { defineExpose, defineComponent, h, ref, getCurrentInstance } from 'vue';
import { useFreeField, freeFieldProps } from '../components/useFreeField';
import { QCheckbox } from 'quasar';

export default defineComponent({
  name: 'InputFieldAgreementCheck',
  fieldInfo: {
    Category: 'Simple',
    Label: '协议同意勾选框',
    Value: 'AgreementCheck',
    Extra: [
      {
        Type: 'Check',
        Label: '居中显示',
        Name: 'Options.Center',
      },
    ],
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  emits: ['input'],
  setup(props, { emit }){
    if (!props.Field) return {};

    const { proxy:vm } = getCurrentInstance();
    const { fieldData, setFieldData } = useFreeField(props);
    const hasError = ref(false);

    const fieldTip = (tip) => {
      if (!tip || !tip.Text) return '';
      if (!tip.Links || !Array.isArray(tip.Links) || tip.Links.length <= 0) {
        return [{ Text: tip.Text }];
      }

      // process tip with links
      let linkPos = [];
      tip.Links.forEach((tl) => {
        if (!tl || !tl.Text || !tl.Link) return;

        const start = tip.Text.indexOf(tl.Text);
        if (start >= 0) {
          linkPos.push({
            start,
            end: start + tl.Text.length,
            Link: tl.Link,
            File: tl.File,
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
          Text: tip.Text.substr(lp.start, lp.end - lp.start),
          Link: lp.File
            ? vm.$filter('serverDocument', lp.File)
            : lp.Link,
        });

        start += lp.end;
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

    const validate = () => {
      if (props.Field.Required) {
        hasError.value = typeof fieldData.value === 'undefined' || !fieldData.value;
        return !hasError.value;
      }

      const rules = Array.isArray(typeof props.Field.Rules)
        ? props.Field.Rules
        : [props.Field.Rules];

      let isValid = true;
      for (let i = 0; i < rules.length; i += 1) {
        const r = rules[i];

        if (typeof r === 'function') {
          isValid = isValid && r(fieldData.value);
        }
      }

      hasError.value = !isValid;
      return isValid;
    };

    const checkboxNode = () => h(QCheckbox, {
      disable: props.Field?.ReadOnly,
      label: props.Field?.showLabel ? '' : props.Field?.Label,

      class: 'check',
      style: props.Field.Info?.Style,

      modelValue: fieldData.value,
      'onUpdate:modelValue': (v) => {
        setFieldData(v, emit);
      },
    });

    const tipsNode = () => h('div', {},[
      h('span', {
        class: 'input-field-tips-prefix'
      }),
      h('span',{
        class: 'tips-list'
      }, (props.Field.Tips || []).map((tip) => h('span', {
        class:'input-field-tips-tip',
      }, [
        h('span', {
          class: 'input-field-tips-tip-prefix'
        }),
        fieldTip(tip).map((t) => h('span', {}, [
          t.Link ? h('span', {
            class: 'tip-link'
          },[
            h('span', {class: 'tip-link-prefix'}),
            h('a',{
              href: t.Link,
            },t.Text),
            h('span', {class: 'tip-link-postfix'}),
          ]) : h('span',{class: 'tip-text'}, t.Text),
        ])),
        h('span', {
          class: 'input-field-tips-tip-postfix'
        })
      ]))),
      h('span',{
        class: 'input-field-tips-postfix'
      })
    ]);

    return () => h('div', {
      class: `input-field-agreement-check row items-center no-wrap\
              ${props.Field.Options?.Center ? 'center full-width justify-center' : ''}`,
    }, h('div',{
      class: `row no-wrap items-center relative-position ${hasError.value ? 'input-field--error' : ''}`,
    },[
      props.Field.Options?.Center || h('span', { class: 'field-label-empty', }),
      checkboxNode(),
      tipsNode(),
      hasError.value && h('div', {
        class: 'input-field--error-tag',
      }, h(QIcon,{
        name: 'error',
      }))
    ]));
  },
});
