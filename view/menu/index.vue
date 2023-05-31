<template>
  <div class="admin-menu-mgmt-wrapper full-height q-pa-md">
    <q-tree
      :nodes="(data && data.total) ? data.docs : []"
      ref="menuTree"
      accordion
      no-connectors
      node-key="id"
      label-key="Label"
      @lazy-load="loadSubMenus"
      @update:expanded="onNodeExpanded"
    >
      <template v-slot:default-header="prop">
        <div
          class="row items-center full-width"
          style="border-bottom: solid 1px grey;"
        >
          <div>
            {{ prop.node.Label }}
          </div>
          <q-space></q-space>
          <span
            class="flex justify-start action-buttons"
            v-if="prop.node.addingNew
              || (!prop.node.addingNew && !prop.node.isCategory)"
          >
            <q-btn
              v-if="prop.node.addingNew"
              flat
              icon="add"
              @click.stop="addNode(prop.node)"
            ></q-btn>
            <q-btn
              v-if="!prop.node.addingNew && !prop.node.isCategory"
              flat
              icon="edit"
              @click.stop="editNode(prop.node)"
            ></q-btn>
            <q-btn
              v-if="!prop.node.addingNew && !prop.node.isCategory"
              flat
              icon="delete"
              @click.stop="deleteNode(prop.node)"
            ></q-btn>
          </span>
        </div>
      </template>

      <template v-slot:default-body="prop">
        <div
          v-if="prop.node.id === selectedMenuNode.id"
          class="full-width"
        >
          <free-field
            v-for="(field, fIndex) in menuFields || []"
            :key="fIndex"
            :values="editingMenu"
            :Field="field"
            ref="refsToValid"
          ></free-field>

          <div class="action-btns full-width row justify-center q-gutter-md">
            <q-btn
              :label="$t('saveButtonText')"
              class="btn-primary"
              @click="onSaveClick"
            />
            <q-btn
              :label="$t('cancelButtonText')"
              class="btn-secondary"
              @click="onCancelClick"
            />
          </div>

          <sticky-buttons
            :actions="[
              {Action: 'cancel', icon:'cancel', Label:$t('cancelButtonText')},
              {Action: 'save', icon: 'save', Label:$t('saveButtonText')}
            ]"
            @click="stickyButtonClicked"
          ></sticky-buttons>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useObjectData, objectDataProps } from '../../composible/useObjectData';
import { useFormValidator } from '../../composible/useFormValidator';

export default defineComponent({
  name: 'MenuPage',
  props: {
    ...objectDataProps,
    addMenu: { type: Function, default: () => { } },
    editMenu: { type: Function, default: () => { } },
    deleteMenu: { type: Function, default: () => { } },
  },
  setup(props, ctx) {
    const selectedMenuNode = ref({});
    const editingMenu = ref({});
    const menuFields = ref([]);

    const {
      data,
      refreshData,
    } = useObjectData(props, ctx);

    const {
      validate,
    } = useFormValidator('refsToValid');

    return {
      selectedMenuNode,
      editingMenu,
      menuFields,
      data,
      refreshData,
      validate,
    };
  },
  created() {
    this.menuFields = this.getModule('core-modules').config.menuFields;

    // add route options
    for (let i = 0; i < this.menuFields.length; i += 1) {
      const m = this.menuFields[i];

      if (m.Name === 'Route') {
        const routeList = [];
        const generateRouteList = (rs, p = '') => {
          rs.forEach((r) => {
            if (!r.path || r.path === '*' || r.path.indexOf(':') >= 0) return;

            const rItem = {
              Value: `${p}${r.path.startsWith('/') ? '' : '/'}${
                r.path
              }`.replace(/\/\//g, '/'),
            };

            if (r.meta) {
              rItem.Label = Array.isArray(r.meta)
                ? r.meta.map((rm) => rm.title).join(' > ')
                : r.meta;
            } else {
              (r.children || []).forEach((rc) => {
                if (rc.path === '' && rc.meta && !rItem.Label) {
                  rItem.Label = Array.isArray(rc.meta)
                    ? rc.meta.map((rm) => rm.title).join(' > ')
                    : rc.meta;
                }
              });
            }

            rItem.Label = `${rItem.Label || rItem.Value} (${rItem.Value})`;

            routeList.push(rItem);

            if (r.children) {
              generateRouteList(r.children, rItem.Value);
            }
          });
        };

        generateRouteList(this.ctx.routes);

        m.Options = routeList.sort((a, b) => a.Value - b.Value);

        // add the customize input option
        m.Options.push({
          Label: this.$t('自定义'),
          Value: 'customize',
        });

        break;
      }
    }
  },
  methods: {
    loadSubMenus({ key, done, node /* , fail */ }) {
      this.GetData(key, node, node.Category)
        .then((d) => {
          if (!d || !d.total || !d.docs) done([]);
          else {
            done(d.docs);
          }
        })
        .catch(() => {
          done([]);
        });
    },
    addNode(n) {
      if (this.selectedMenuNode && this.selectedMenuNode.id === n.id) {
        this.selectedMenuNode = {};
        this.editingMenu = {};
        this.$refs.menuTree.setExpanded(n.id, false);
      } else {
        this.selectedMenuNode = n;
        this.editingMenu = {
          Enabled: true,
          Category: n.Category,
        };
      }
    },
    editNode(n) {
      if (this.selectedMenuNode && this.selectedMenuNode.id === n.id) {
        this.selectedMenuNode = {};
        this.editingMenu = {};
        this.$refs.menuTree.setExpanded(n.id, false);
      } else {
        this.selectedMenuNode = n;
        this.editingMenu = { ...n };
        this.$refs.menuTree.setExpanded(n.id, true);
      }
    },
    deleteNode(n) {
      if (n.addingNew || !n.id) return;

      this.$MsgDialog({
        type: '',
        content: this.$t('删除确认', {type: this.$t('菜单'), name: n.Label}),
        canCancel: true,
        okText: this.$t('okButtonText'),
        cancelText: this.$t('cancelButtonText'),
      })
        .then(() => {
          this.deleteMenu(n.id).then((d) => {
            if (d && d.msg === 'OK') {
              this.$q.notify(this.$t('notifyDeleted'));
              this.refreshData();
            } else {
              this.$q.notify(this.$t('notifyDeleteFailed'));
            }
          });
        })
        .catch(() => { });
    },
    onSaveClick() {
      if (!this.validate()) return;
      if (Object.keys(this.editingMenu) <= 0) return;
      // if is adding new
      if (this.selectedMenuNode.addingNew) {
        this.editingMenu = {
          lazy: true,
          Parent: this.selectedMenuNode.Parent,
          level: this.selectedMenuNode.level,
          ...this.editingMenu,
        };

        // fix: the default content for number input will be string!!!!????
        // convert to number
        this.editingMenu.Index = Number(this.editingMenu.Index || '0');

        this.addMenu(this.editingMenu).then((r) => {
          if (r && r.msg === 'OK') {
            const parent = this.$refs.menuTree.getNodeByKey(this.selectedMenuNode.Parent)
              || this.$refs.menuTree.getNodeByKey(this.selectedMenuNode.Category);

            if (parent) {
              parent.children.push(
                { id: r.data.id, ...this.editingMenu },
              );
              parent.children = parent.children.sort(
                (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
              );
            } else {
              this.data.docs.push(
                { id: r.data.id, ...this.editingMenu },
              );
              this.data.docs = this.data.docs.sort(
                (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
              );
            }
          } else {
            this.$q.notify((r && r.msg) || this.$t('notifyAddFailed'));
          }

          this.editingMenu = {};
          this.selectedMenuNode = {};
        });
      } else {
        // editing
        const updatingMenu = { ...this.editingMenu };
        delete updatingMenu.children;
        delete updatingMenu.level;
        delete updatingMenu.lazy;
        this.editMenu(updatingMenu).then((r) => {
          if (r && r.msg === 'OK') {
            let currentNode = this.$refs.menuTree.getNodeByKey(
              this.editingMenu.id,
            );
            if (currentNode) {
              currentNode = Object.assign(currentNode, this.editingMenu);
            }

            // order
            const parent = this.$refs.menuTree.getNodeByKey(
              this.selectedMenuNode.Parent,
            );
            if (parent) {
              parent.children = parent.children.sort(
                (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
              );
            } else {
              this.data.docs = this.data.docs.sort(
                (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
              );
            }
          }

          this.editingMenu = {};
          this.selectedMenuNode = {};
        });
      }
    },
    onCancelClick() {
      this.editingMenu = {};
      this.selectedMenuNode = {};
    },
    onNodeExpanded() {
      this.editingMenu = {};
      this.selectedMenuNode = {};
    },
    stickyButtonClicked(a) {
      if (!a || !a.Action) return;

      if (a.Action === 'save') {
        this.onSaveClick();
      } else if (a.Action === 'cancel') {
        this.onCancelClick();
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.admin-menu-mgmt-wrapper {
  background: $background;
}
</style>
