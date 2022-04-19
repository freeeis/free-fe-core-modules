import EditableString from "./EditableString";
import AutoHide from "./AutoHide";
import FieldCategory from "./FieldCategory";
import FieldTypeSelect from "./FieldTypeSelect";
import CenterContent from "./CenterContent";

import Draggable from "./Draggable";
import Droppable from "./Droppable";

import FieldEditors from "./fieldEditors";

export default {
  EditableString,
  AutoHide,
  FieldCategory,
  FieldTypeSelect,
  CenterContent,
  Draggable,
  Droppable,

  ...FieldEditors,
  freeDialog: {
    slots: ["default"],
    params: {
      visible: false,
      wrapperStyle: "",
      shadow: "2",
      background: "white",
      close: true,
    },
    elements: [
      {
        tag: "div",
        props: {
          class: "free-dialog-mask absolute-full",
          style: "position: fixed; z-index: 20;background:transparent;",
        },
        if: [
          {
            s1: "{{visible}}",
            o1: "=",
            s2: true,
          },
        ],
        slots: {
          default: [
            {
              tag: "div",
              props: {
                class:
                  "free-dialog-wrapper absolute-center column bg-{{background}} shadow-{{shadow}}",
                style: "{{wrapperStyle}}",
              },
              slots: {
                default: [
                  {
                    tag: "div",
                    if: [
                      {
                        s1: "{{close}}",
                        o1: "=",
                        s2: true,
                      },
                    ],
                    props: {
                      style:
                        "position: absolute; right: -8px; top: -8px;z-index: 21;",
                    },
                    slots: {
                      default: [
                        {
                          name: "QIcon",
                          props: {
                            name: "cancel",
                            size: "sm",
                            class: "cursor-pointer",
                            onClick: [
                              {
                                type: "action",
                                name: "emit",
                                props: {
                                  trigger: "closeDialog",
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    tag: "div",
                    props: {
                      class: "free-dialog-content col",
                    },
                    slots: {
                      default: [
                        {
                          tag: "slot",
                          name: "default",
                        },
                      ],
                    },
                  },
                  {
                    tag: "div",
                    props: {
                      class:
                        "free-dialog-actions row no-wrap item-center justify-center q-ma-md",
                    },
                    slots: {
                      default: [
                        {
                          tag: "slot",
                          name: "actions",
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  freeAdminLayout: {
    params: {
      id: "",
      logo: "",
      logoHeight: "60px",
      logoWidth: "100px",
      actionsLeft: false,
      actions: [],
      toolbarHeight: "60px",
      userName: "admin",
      now: "2021-10-12",
    },
    props: {},
    slots: ["default", "logo", "actions", "user"],
    elements: [
      {
        name: "QLayout",
        props: {
          id: "{{id}}",
          class: "free-layout",
        },
        slots: {
          default: [
            {
              name: "QHeader",
              props: {},
              slots: {
                default: [
                  {
                    name: "QToolbar",
                    props: {
                      style: "height: {{toolbarHeight}};",
                    },
                    slots: {
                      default: [
                        {
                          if: [
                            {
                              s1: "{{logo}}",
                            },
                          ],
                          name: "QImg",
                          props: {
                            src: "{{logo}}",
                            fit: "scale-down",
                            height: "{{logoHeight}}",
                            width: "{{logoWidth}}",
                            alt: "{{app.config.siteName}}",
                          },
                        },
                        {
                          tag: "slot",
                          name: "logo",
                          if: [
                            {
                              s1: "{{logo}}",
                              o1: "!",
                            },
                          ],
                        },
                        {
                          name: "QSpace",
                          if: [
                            {
                              s1: "{{actionsLeft}}",
                              o1: "!"
                            }
                          ]
                        },
                        {
                          if: [
                            {
                              s1: "{{actions.length}}"
                            }
                          ],
                          for: "{{actions}}",
                          "for-item": "action",
                          name: "QBtn",
                          props: {
                            label: "{{action.label}}",
                            to: "{{action.to}}",
                          },
                        },
                        {
                          if: [
                            {
                              s1: "{{actions.length}}",
                              o1: "<=",
                              s2: 0
                            }
                          ],
                          tag: "slot",
                          name: "actions"
                        },
                        {
                          name: "QSpace",
                          if: [
                            {
                              s1: "{{actionsLeft}}",
                            }
                          ]
                        },
                        {
                          name: "QBtn",
                          if: [
                            {
                              s1: "{{app.modules.account}}",
                              o1: "exists",
                            },
                          ],
                          props: {
                            flat: true,
                            class: "user-profile-btn",
                          },
                          slots: {
                            default: [
                              {
                                tag: "div",
                                props: {
                                  class:
                                    "row no-wrap items-center justify-center",
                                },
                                slots: {
                                  default: [
                                    {
                                      name: "QIcon",
                                      props: {
                                        name: "fas fa-user-tie",
                                        class: "avatar q-mr-sm",
                                        size: "md",
                                      },
                                    },
                                    {
                                      tag: "span",
                                      props: {
                                        class:
                                          "user-name ellipsis q-ml-xs q-mr-md",
                                      },
                                      slots: {
                                        default: [
                                          "{{userName}}",
                                          {
                                            tag: "div",
                                            props: {
                                              class: "date-label",
                                            },
                                            slots: {
                                              default: ["{{now}}"],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                    {
                                      name: "QIcon",
                                      props: {
                                        class: "user-profile-menu-icon",
                                        name: "keyboard_arrow_down",
                                      },
                                    },
                                  ],
                                },
                              },
                              {
                                name: "QMenu",
                                props: {
                                  "content-class": "user-profile-menu",
                                },
                                slots: {
                                  default: [
                                    {
                                      name: "QList",
                                      props: {
                                        style: "min-width: 191px",
                                      },
                                      slots: {
                                        default: [
                                          {
                                            name: "QItem",
                                            props: {},
                                            slots: {
                                              default: [
                                                {
                                                  name: "QItemSection",
                                                  slots: {
                                                    default: [
                                                      {
                                                        name: "QBtn",
                                                        props: {
                                                          label: "Logout",
                                                          class: "logout-btn",
                                                          flat: true,
                                                          "v-close-popup": "-1",
                                                          onClick: {
                                                            type: "action",
                                                            name: "logout",
                                                            module: "account",
                                                          },
                                                        },
                                                      },
                                                    ],
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              name: "QDrawer",
              props: {},
              slots: {
                default: [],
              },
            },
            {
              name: "QPageContainer",
              props: {},
              slots: {
                default: [
                  {
                    name: "QPage",
                    props: {},
                    slots: {
                      default: [
                        {
                          tag: "slot",
                          name: 'default'
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  printBtn: {
    params: {
      data: '',
      label: 'Print'
    },
    elements: [
      {
        name: 'QBtn',
        props: {
          label: "{{label}}",
          onClick: {
            type: 'action',
            name: 'log',
            props: {
              data: "{{data}}"
            }
          }
        }
      }
    ]
  }
};
