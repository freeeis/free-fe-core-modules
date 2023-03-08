<template>
  <div class="admin-dictionary-mgmt-wrapper full-height q-pa-md">
    <q-tree
      :nodes="(data && data.total) ? data.docs : []"
      ref="dictTree"
      accordion
      no-connectors
      node-key="id"
      label-key="Label"
      @lazy-load="loadSubDicts"
      @update:expanded="onNodeExpanded"
    >
      <template v-slot:default-header="prop">
        <div
          class="dictionary-head row items-center full-width"
          style="border-bottom: solid 1px grey;"
        >
          <div>
            {{ prop.node.Label }}
            <span
              v-if="prop.node.level === 1 && prop.node.Name"
              class="dictionary-data-name"
            >({{prop.node.Name}})</span>
            <div
              v-if="prop.node.Description"
              caption
              class="description ellipsis-3-lines"
              v-html="prop.node.Description"
            ></div>
          </div>
          <q-space></q-space>

          <span class="flex justify-start action-buttons">
            <q-btn v-if="prop.node.addingNew" flat icon="add"
              @click.stop="addNode(prop.node)"></q-btn>
            <q-btn v-if="!prop.node.addingNew" flat icon="edit"
              @click.stop="editNode(prop.node)"></q-btn>
            <q-btn
              v-if="!prop.node.addingNew"
              :disabled="prop.node.BuiltIn"
              flat
              icon="delete"
              @click.stop="deleteNode(prop.node)"
            ></q-btn>
          </span>
        </div>
      </template>

      <template v-slot:default-body="prop">
        <div v-if="prop.node.id === selectedDictNode.id" class="full-width">
          <div v-for="(field, fIndex) in dictFields || []" :key="fIndex">
            <free-field
              v-if="field.Name !== 'Name' || !selectedDictNode.Parent"
              :values="editingDict"
              :Field="field"
            ></free-field>
          </div>

          <div class="action-btns full-width row justify-center q-gutter-md">
            <q-btn :label="$t('saveButtonText')" class="btn-primary" @click="onSaveClick" />
            <q-btn :label="$t('cancelButtonText')" class="btn-secondary" @click="onCancelClick" />
          </div>

          <sticky-buttons
            :actions="[
              {
              Action: 'cancel',
              icon:'cancel',
              Label: $t('cancelButtonText')
              },{
                Action: 'save',
                icon: 'save',
                Label:$t('saveButtonText')
              }
            ]"
            @click="stickyButtonClicked"
          ></sticky-buttons>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>
import mixins from 'free-fe-mixins';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DictionaryPage',
  mixins: [mixins.ObjectDataMixin],
  props: {
    addDict: { type: Function, default: () => {} },
    editDict: { type: Function, default: () => {} },
    deleteDict: { type: Function, default: () => {} },
  },
  data() {
    return {
      selectedDictNode: {},
      editingDict: {},
      dictFields: [],
    };
  },
  watch: {
    // eslint-disable-next-line func-names
    'editingDict.Type': function (v) {
      const valueField = this.dictFields.find((f) => f.Name === 'Value');
      if (valueField) {
        if (v === 'File') {
          valueField.Type = 'File';
        } else {
          valueField.Type = 'String';
        }
      }
    },
  },
  created() {
    this.dictFields = this.getModule('core-modules').config.dictFields;
  },
  methods: {
    loadSubDicts({ key, done, node /* , fail */ }) {
      this.GetData(key, node.level)
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
      if (this.selectedDictNode && this.selectedDictNode.id === n.id) {
        this.selectedDictNode = {};
        this.editingDict = {};
        this.$refs.dictTree.setExpanded(n.id, false);
      } else {
        this.selectedDictNode = n;
        this.editingDict = {
          Type: 'String',
        };
      }
    },
    editNode(n) {
      if (this.selectedDictNode && this.selectedDictNode.id === n.id) {
        this.selectedDictNode = {};
        this.editingDict = {};
        this.$refs.dictTree.setExpanded(n.id, false);
      } else {
        this.selectedDictNode = n;
        this.editingDict = { ...n };
        this.$refs.dictTree.setExpanded(n.id, true);
      }
    },
    deleteNode(n) {
      if (n.addingNew || !n.id) return;

      this.$MsgDialog({
        type: '',
        content: `确认要删除字典项 '${n.Name}' 吗?`,
        canCancel: true,
        okText: this.$t('okButtonText'),
        cancelText: this.$t('cancelButtonText'),
      })
        .then(() => {
          this.deleteDict(n.id).then((d) => {
            if (d && d.msg === 'OK') {
              this.refreshData();
            }
          });
        })
        .catch(() => {});
    },
    onSaveClick() {
      if (Object.keys(this.editingDict) <= 0) return;
      // if is adding new
      if (this.selectedDictNode.addingNew) {
        this.editingDict = {
          lazy: true,
          Parent: this.selectedDictNode.Parent,
          level: this.selectedDictNode.level,
          ...this.editingDict,
        };

        // fix: the default content for number input will be string!!!!????
        // convert to number
        this.editingDict.Index = Number(this.editingDict.Index || '0');

        this.addDict(this.editingDict).then((r) => {
          if (r && r.msg === 'OK') {
            const parent = this.$refs.dictTree.getNodeByKey(
              this.selectedDictNode.Parent,
            );
            if (parent) {
              parent.children.push(
                { id: r.data.id, ...this.editingDict },
              );
              parent.children = parent.children.sort(
                (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
              );
            } else {
              this.data.docs.push(
                { id: r.data.id, ...this.editingDict },
              );
              this.data.docs = this.data.docs.sort(
                (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
              );
            }
          } else {
            this.$q.notify((r && r.msg) || this.$t('notifyAddFailed'));
          }

          this.editingDict = {};
          this.selectedDictNode = {};
        });
      } else {
        // editing
        const updatingDict = { ...this.editingDict };
        delete updatingDict.children;
        delete updatingDict.level;
        delete updatingDict.lazy;
        this.editDict(updatingDict).then((r) => {
          if (r && r.msg === 'OK') {
            let currentNode = this.$refs.dictTree.getNodeByKey(
              this.editingDict.id,
            );
            if (currentNode) {
              currentNode = Object.assign(currentNode, this.editingDict);
            }

            // order
            const parent = this.$refs.dictTree.getNodeByKey(
              this.selectedDictNode.Parent,
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

          this.editingDict = {};
          this.selectedDictNode = {};
        });
      }
    },
    onCancelClick() {
      this.editingDict = {};
      this.selectedDictNode = {};
    },
    onNodeExpanded() {
      this.editingDict = {};
      this.selectedDictNode = {};
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

<style lang="sass" scoped>
.admin-dictionary-mgmt-wrapper
  .dictionary-head
    .description
      max-width: 680px
      font-size: 12px
      font-weight: 400
    .dictionary-data-name
      font-size: 14px
      font-weight: normal
</style>
