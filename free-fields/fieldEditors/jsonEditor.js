import {
  defineComponent,
  resolveDynamicComponent,
  h,
  ref,
  reactive,
  watchEffect,
  nextTick,
  computed,
} from "vue";
import { QBtn, QTree, QScrollArea } from "quasar";
import EditableString from "../EditableString";
import FieldTypeSelect from '../FieldTypeSelect';

import StringEditor from "./stringEditor";
import NumberEditor from "./numberEditor";
import BooleanEditor from "./boolEditor";
import DateEditor from "./dateEditor";
import TimeEditor from "./timeEditor";

//TODO: add selection field type by providing selections and default value
const fEditors = {
  String: StringEditor,
  Number: NumberEditor,
  Boolean: BooleanEditor,
  Date: DateEditor,
  Time: TimeEditor,
};

export default (isArray = false) =>
  defineComponent({
    name: "FreeFieldJsonEditor",
    props: {
      dense: Boolean,
      icon: String,
      modelValue: [Array, Object],
      // TODO: to implement with provided schema
      schema: [Array, Object],
      valueClickStop: {type: Boolean, default: true},
      submitOnClose: {type: Boolean, default: true}
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
      const freeDialog = resolveDynamicComponent('freeDialog');
      const showEditor = ref(false);
      let expanded = reactive(['']);
      const treeRef = ref(null);
      let localValue;

      watchEffect(() => {
        localValue = props.modelValue;
      });

      const treeNodes = computed(() => {
        const calcNode = (d, pp = "") => {
          if (Array.isArray(d)) {
            const ret = {
              type: "Array",
              path: pp,
              children: [],
            };
            d.forEach((da, idx) => {
              const pth = pp ? `${pp}.${idx}` : `${idx}`;
              const cn = calcNode(da, pth);

              if (cn !== void 0) {
                ret.children.push({
                  ...cn,
                  path: pth,
                  name: idx,
                  ptype: "Array",
                  parent: ret,
                });
              }
            });

            ret.children.push({
              path: pp ? `${pp}.${d.length}` : `${d.length}`,
              name: d.length,
              ptype: "Array",
              type: "String",
              value: "",
              parent: ret,
              new: true,
            });

            return ret;
          } else if (typeof d === "object") {
            const ret = {
              type: "Object",
              path: pp,
              children: [],
            };

            const dks = Object.keys(d);
            dks.forEach((dk) => {
              const pth = pp ? `${pp}.${dk}` : `${dk}`;
              const cn = calcNode(d[dk], pth);

              if (cn !== void 0) {
                ret.children.push({
                  ...cn,
                  path: pth,
                  name: dk,
                  ptype: "Object",
                  parent: ret,
                });
              }
            });

            const nextNum = dks.length + 1;
            ret.children.push({
              path: pp ? `${pp}.new${nextNum}` : `new${nextNum}`,
              name: `new${nextNum}`,
              ptype: "Object",
              type: "String",
              value: "",
              parent: ret,
              new: true,
            });

            return ret;
          } else {
            let type = "String";
            const dtype = typeof d;

            if (dtype === "string" || dtype === "undefined") {
              type = "String";
            } else if (dtype === "number") {
              type = "Number";
            } else if (dtype === "boolean") {
              type = "Boolean";
            }

            return {
              value: d,
              type,
            };
          }
        };

        return (typeof localValue !== 'undefined') ? [{ ...calcNode(localValue), root: true, path: '' }] : [];
      });

      return () =>
        showEditor.value
          ? h(freeDialog, {
            visible: true,
            wrapperStyle: 'min-width: 500px; min-height: 600px; max-height: 95%;max-width: 95%;',
            shadow: '1',
            background: 'white',
            onFreeTrigger: (e) => {
              if(e.trigger === 'closeDialog') {
                showEditor.value = false;
              }
            }
          } ,{
            default: () =>h(QScrollArea,
              {
                class: 'full-width absolute q-pa-sm',
                style: 'height: calc(100% - 60px)',
              },
              () => [
                h(QTree,
                  {
                    ref: treeRef,
                    dense: true,
                    nodes: treeNodes.value,
                    accordion: true,
                    expanded: expanded,
                    'onUpdate:expanded': (e) => {
                      Object.assign(expanded, e);
                      expanded.splice(e.length);
                    },
                    "node-key": "path",
                    "label-key": "name",
                  },
                  {
                    "default-header": (n) => {
                      return n.node.root
                        ? "root"
                        : [
                          h(FieldTypeSelect, {
                            modelValue: n.node.type,
                            "onUpdate:modelValue": (e) => {
                              let nv = undefined;
                              switch (e) {
                                case "Array":
                                  nv = [];
                                  break;
                                case "Object":
                                  nv = {};
                                  break;
                                case "String":
                                  nv = "";
                                  break;
                                case "Number":
                                  nv = 0;
                                  break;
                                case "Boolean":
                                  nv = false;
                                  break;
                                case "Date":
                                  nv = new Date();
                                  break;
                                default:
                                  break;
                              }

                              Object.setValue(
                                localValue,
                                `${n.node.path}`,
                                nv
                              );

                              if(!props.submitOnClose)
                                emit("update:modelValue", localValue);
                            },
                          }),
                            h(EditableString, {
                              class: "q-mx-md",
                              modelValue: n.node.name,
                              "onUpdate:modelValue": (nv) => {
                                if(nv === void 0 || nv === '' || nv === n.node.name) return;

                                const parent = n.node.parent.path ? Object.nestValue(
                                  localValue,
                                  n.node.parent.path
                                ) : localValue;

                                if (n.node.parent.type === "Array") {
                                  parent[nv] = parent[n.node.name];
                                  parent[n.node.name] = "";

                                  Object.setValue(
                                    localValue,
                                    `${n.node.parent.path}`,
                                    parent
                                  );

                                  if(!props.submitOnClose)
                                    emit("update:modelValue", localValue);
                                } else if (
                                  n.node.parent.type === "Object"
                                ) {
                                  const pks = Object.keys(parent);
                                  const kidx = pks.indexOf(n.node.name);

                                  if (kidx >= 0) {
                                    pks[kidx] = nv;

                                    if(n.node.parent.path){
                                      const nobj = {};
                                      pks.forEach((pk,idx) => {
                                        if (idx === kidx) {
                                          nobj[pk] = parent[n.node.name];
                                        } else {
                                          nobj[pk] = parent[pk];
                                        }
                                      });

                                      Object.setValue(
                                        localValue,
                                        `${n.node.parent.path}`,
                                        nobj
                                      );
                                    } else {
                                      const copyValue = { ...localValue };
                                      delete localValue[n.node.name];
                                      pks.forEach(pk => delete localValue[pk]);
                                      pks.forEach((pk,idx) => {
                                        if (idx === kidx) {
                                          localValue[pk] = copyValue[n.node.name];
                                        } else {
                                          localValue[pk] = copyValue[pk];
                                        }
                                      });
                                    }
                                  } else {
                                    Object.setValue(parent, nv, n.node.value);
                                  }

                                  if(!props.submitOnClose)
                                    emit("update:modelValue", localValue);
                                }
                              },
                            }),
                            (n.node.root || !fEditors[n.node.type])
                              ? undefined
                              : h(fEditors[n.node.type], {
                                  dense: true,
                                  borderless: true,
                                  filled: true,
                                  placeholder: 'input',
                                  style: "opacity: 0.6;",
                                  modelValue: n.node.value,
                                  class: 'q-space',
                                  onClick: (e) => {
                                    // workaround for issue: cannot focus the input control when putting in the header
                                    if(props.valueClickStop) {
                                      e.stopPropagation()
                                    }
                                  },
                                  "onUpdate:modelValue": (e) => {
                                    Object.setValue(
                                      localValue,
                                      `${n.node.path}`,
                                      e
                                    );

                                    if(!props.submitOnClose)
                                      emit("update:modelValue", localValue);
                                  },
                                }
                              )
                          ];
                    },
                  }
                ),
              ]),
              actions: () => h(QBtn, {
                label: 'Close',
                class: '',
                onClick: () => {
                  showEditor.value = false;

                  nextTick(() => {
                    if(props.submitOnClose) {
                      emit("update:modelValue", localValue);
                    }
                  })
                }
              })
          })
          : props.dense ? h(QBtn, {
            dense: true,
            flat: true,
            size: 'sm',
            icon: props.icon || 'edit',
            onClick: () => {
              nextTick(() => {
                showEditor.value = true;
              });
            },
          }) : h(
              "div",
              {
                class: "row no-wrap",
                style: "min-width: 100px;",
                // modelValue: props.modelValue,
                // "onUpdate:modelValue": (e) => {
                //   emit("update:modelValue", e);
                // },
              },
              [
                "...",
                h(QBtn, {
                  class: "q-ml-xs",
                  dense: true,
                  flat: true,
                  icon: props.icon || "edit",
                  onClick: () => {
                    nextTick(() => {
                      showEditor.value = true;
                    });
                  },
                }),
              ]
            );
    },
  });
