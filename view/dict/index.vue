<template>
  <div class="admin-dictionary-mgmt-wrapper full-height q-pa-md">
    <q-tree :nodes="(data && data.total) ? data.docs : []" ref="dictTree" accordion no-connectors node-key="id"
      label-key="Label" @lazy-load="loadSubDicts" @update:expanded="onNodeExpanded">
      <template v-slot:default-header="prop">
        <div class="dictionary-head row items-center full-width" style="border-bottom: solid 1px grey;">
          <div>
            {{ dictLabel(prop.node) }}
            <span v-if="prop.node.level === 1 && prop.node.Name" class="dictionary-data-name">({{ prop.node.Name
            }})</span>
            <div v-if="prop.node.Description" caption class="description ellipsis-3-lines"
              v-html="prop.node.Description"></div>
          </div>
          <q-space></q-space>

          <span class="flex justify-start action-buttons">
            <q-btn v-if="prop.node.addingNew" flat icon="add" @click.stop="addNode(prop.node)"></q-btn>
            <q-btn v-if="!prop.node.addingNew" flat icon="edit" @click.stop="editNode(prop.node)"></q-btn>
            <q-btn v-if="!prop.node.addingNew" :disabled="prop.node.BuiltIn" flat icon="delete"
              @click.stop="deleteNode(prop.node)"></q-btn>
          </span>
        </div>
      </template>

      <template v-slot:default-body="prop">
        <div v-if="prop.node.id === selectedDictNode.id" class="full-width">
          <div v-for="(field, fIndex) in dictFields || []" :key="fIndex">
            <free-field v-if="field.Name !== 'Name' || !selectedDictNode.Parent" :values="editingDict" :Field="field"
              ref="fieldsToValidate"></free-field>
          </div>

          <div class="action-btns full-width row justify-center q-gutter-md">
            <q-btn :label="$t('saveButtonText')" class="btn-primary" @click="onSaveClick" />
            <q-btn :label="$t('cancelButtonText')" class="btn-secondary" @click="onCancelClick" />
          </div>

          <sticky-buttons :actions="[
            {
              Action: 'cancel',
              icon: 'cancel',
              Label: $t('cancelButtonText')
            }, {
              Action: 'save',
              icon: 'save',
              Label: $t('saveButtonText')
            }
          ]" @click="stickyButtonClicked"></sticky-buttons>
        </div>
      </template>
    </q-tree>

    <div class="row items-center justify-center q-my-md" v-if="canImport">
      <q-btn flat @click="exportTranslates" class="btn-primary q-mr-md">导出翻译</q-btn>
      <q-btn flat @click="importTranslates" class="btn-primary">导入翻译</q-btn>

      <div class="row full-width q-mt-md">
        <q-input v-if="showImportTextArea" class="full-width" type="textarea" autogrow v-model="importText" placeholder="请输入要导入的内容(tab键分割)，如：
    xxx类型 类型一  en-us Type One
    xxx类型 类型二  en-us Type Two"></q-input>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { copyToClipboard } from 'quasar';
import { requests } from '@/boot/axios';
import { useObjectData, objectDataProps } from '../../composible/useObjectData.js';
import { useFormValidator} from '../../composible/useFormValidator.js';

export default defineComponent({
  name: 'DictionaryPage',
  props: {
    ...objectDataProps,
    addDict: { type: Function, default: () => {} },
    editDict: { type: Function, default: () => {} },
    deleteDict: { type: Function, default: () => {} },
  },
  data() {
    return {
      selectedDictNode: {},
      editingDict: {},
      dictFields: [],
      canImport: false,
      importText: '',
      showImportTextArea: false,
    };
  },
  emits: ['onUpdate:modelValue'],
  setup(props, ctx) {
    const {
      data,
      refreshData,
    } = useObjectData(props, ctx);

    const { validate } = useFormValidator('fieldsToValidate');

    return {
      data,
      refreshData,
      validate,
    };
  },
  watch: {

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
  beforeCreate() {
    requests.canI('dict/import').then((r) => {
      if (r) {
        this.canImport = true;
      }
    });
  },
  created() {
    this.dictFields = this.getModule('core-modules').config.dictFields;
  },
  computed: {
    dictLabel() {
      return (d) => {
        if (!d || !d.Labels) return '';

        const lb = d.Labels.find((l) => l.Locale === this.$i18n.locale );
        return lb && lb.Label;
      }
    }
  },
  methods: {
    makeLabelsName(n) {
      n.Labels = n.Labels || [];
      // check labels according to the locales
      const locales = this.ctx.config.locales || [];
      for(let i = 0; i < locales.length; i += 1) {
        const locale = locales[i];
        const existsLabel = n.Labels.find((l) => l.Locale === locale.locale);

        if (!existsLabel) {
          n.Labels.push({
            Label: '',
            Locale: locale.locale,
            Description: '',
            Name: locale.name,
          });
        } else {
          existsLabel.Name = locale.name;
        }
      }
    },
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
        // collapse the node when clicking it again (after clicking add button)
        this.selectedDictNode = {};
        this.editingDict = {};
        this.$refs.dictTree.setExpanded(n.id, false);
      } else {
        // add new node
        this.selectedDictNode = n;
        this.editingDict = {
          Type: 'String',
          Labels: this.ctx.config.locales.map((l) => ({
            Label: '',
            Locale: l.locale,
            Description: '',
            Name: l.name,
          })),
        };
      }

      this.makeLabelsName(this.editingDict);
    },
    editNode(n) {
      if (!n) return;

      this.makeLabelsName(n);

      if (this.selectedDictNode && this.selectedDictNode.id === n.id) {
        // collapse the node when clicking it again (after clicking edit button)
        this.selectedDictNode = {};
        this.editingDict = {};
        this.$refs.dictTree.setExpanded(n.id, false);
      } else {
        // edit node
        n.Labels = n.Labels || [];
        // check labels according to the locales
        const locales = this.ctx.config.locales || [];
        for(let i = 0; i < locales.length; i += 1) {
          const locale = locales[i];
          const existsLabel = n.Labels.find((l) => l.Locale === locale.locale);

          if (!existsLabel) {
            n.Labels.push({
              Label: '',
              Locale: locale.locale,
              Description: '',
              Name: locale.name,
            });
          } else {
            existsLabel.Name = locale.name;
          }
        }

        this.selectedDictNode = n;
        this.editingDict = { ...n };
        this.$refs.dictTree.setExpanded(n.id, true);
      }
    },
    deleteNode(n) {
      if (n.addingNew || !n.id) return;

      let label = (n.Labels || []).find((l) => l.Locale === this.$i18n.locale);
      label = label && label.Label;

      this.$MsgDialog({
        type: '',
        content: this.$t('删除确认', { type: this.$t('字典项'), name: label || n.Name }),
        canCancel: true,
        okText: this.$t('okButtonText'),
        cancelText: this.$t('cancelButtonText'),
      })
        .then(() => {
          this.deleteDict(n.id).then((d) => {
            if (d && d.msg === 'OK') {
              const parentNode = this.$refs.dictTree.getNodeByKey(n.Parent);
              if (parentNode) {
                parentNode.children = parentNode.children.filter((c) => c.id !== n.id);
              } else {
                this.data.docs = this.data.docs.filter((c) => c.id !== n.id);
              }
            }
          });
        })
        .catch(() => {});
    },
    onSaveClick() {
      if (Object.keys(this.editingDict) <= 0) return;

      if (!this.validate()) return;

      // clear labels without label
      this.editingDict.Labels = (this.editingDict.Labels || []).filter(
        (l) => l.Label,
      );

      // if is adding new
      if (this.selectedDictNode.addingNew) {
        this.editingDict = {
          lazy: true,
          Parent: this.selectedDictNode.Parent,
          level: this.selectedDictNode.level,
          ...this.editingDict,
        };

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
    importTranslates() {
      if (!this.showImportTextArea) {
        this.showImportTextArea = true;
        this.importText = '';
      } else {
        // do the i
        this.postRequest('/dict/import/trans', {c: this.importText}).then((d) => {
          if (d && d.msg === 'OK') {
            this.$q.notify('导入成功！');
          }
        });
      }
    },
    exportTranslates() {
      this.showImportTextArea = false;
      this.getRequest('/dict/export/trans').then((d) => {
        if (d.data.c) {
          copyToClipboard(d.data.c);
          this.$q.notify('已拷贝到剪切板，可直接粘贴至excel等工具！');
        }
      });
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
