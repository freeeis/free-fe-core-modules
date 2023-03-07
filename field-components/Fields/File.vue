<template>
  <div class="row input-field-file">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="typeof Field.Label !== 'undefined'"
    >
      <q-tooltip
        v-if="Field.Description"
        anchor="top right"
      >{{Field.Description}}</q-tooltip>
      {{Field.Label || ''}}
      <span
        v-if="Field.Required"
        class="required-mark"
      >*</span>
    </span>

    <q-uploader
      @uploaded="uploaded"
      @removed="fieldData = ''; $emit('input')"
      @rejected="filesRejected"
      ref="uploader"
      :factory="factoryFn"
      auto-upload
      :max-file-size="maxFileSize"
      :accept="acceptedFileTypes"
      :class="`q-ma-xs ${hasError ? 'input-field--error' : ''}`"
    >
      <template v-slot:list="scope">
        <div
          v-if="Field.Options && Field.Options.AsLink && scope.files.length"
          class="file-link row full-width ellipsis items-center"
        >
          <div
            class="row ellipsis full-width"
            v-for="(file, index) in scope.files"
            :key="index"
          >
            <q-btn
              icon="cloud_download"
              dense
              flat
            ></q-btn>
            <a
              class="ellipsis"
              target="_blank"
              :href="runFilter('serverPath',file.id)"
              :download="file.name"
            >
              {{ file.name }}
              <q-tooltip>{{ file.name }}</q-tooltip>
            </a>
          </div>
        </div>
        <div v-else>
          <div
            class="uploader-btns row no-wrap items-center"
            v-if="!dense"
          >
            <q-spinner
              v-if="scope.isUploading"
              class="q-uploader__spinner"
            />
            <q-btn
              v-if="!scope.isUploading && !Field.ReadOnly"
              type="a"
              icon="cloud_upload"
              dense
              flat
              class="upload-btn"
              label="点击上传"
            >
              <q-uploader-add-trigger v-if="!Field.ReadOnly" />
            </q-btn>
            <q-btn
              v-if="scope.isUploading && !Field.ReadOnly"
              icon="clear"
              @click="scope.abort"
              class="clear-btn"
              round
              dense
              flat
            ></q-btn>
            <slot name="warning"></slot>
          </div>

          <q-item v-if="dense && scope.files.length">
            <q-item-section v-if="scope.files.length && scope.files[0].name">
              <q-item-label class="full-width ellipsis">
                {{ scope.files[0].name }}
                <q-tooltip>{{ scope.files[0].name }}</q-tooltip>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn
                v-if="!scope.isUploading && !Field.ReadOnly"
                type="a"
                icon="cloud_upload"
                class="upload-btn"
                dense
                flat
              >
                <q-uploader-add-trigger v-if="!Field.ReadOnly" />
              </q-btn>
            </q-item-section>
          </q-item>

          <div
            v-else-if="scope.files.length"
            class="file-list row items-start justify-start"
          >
            <q-card
              flat
              class="file-list-item"
              v-for="(file, index) in scope.files"
              :key="index"
            >
              <e-icon
                class="file-image"
                :name="fileThumb(file)"
                thumb
                :relative="filePreviewType(file) !== 'image'"
                @click="preview(file)"
              >
                <div class="view-btn-wrapper absolute-full justify-center text-center">
                  <q-btn
                    flat
                    class="view-btn full-height full-width"
                  >查看</q-btn>
                </div>
              </e-icon>
              <span class="file-name full-width ellipsis">
                <a
                  v-if="file && file.id"
                  target="_blank"
                  :href="runFilter('serverPath',file.id)"
                  :download="file.name">
                    {{ file.name }}
                </a>
                <span v-else-if="file && file.name">
                  {{file.name}}
                </span>
                <q-tooltip>{{ file.name }}</q-tooltip>
              </span>

              <span class="file-size full-width ellipsis">
                Size: {{ file.sizeLabel || file.__sizeLabel }}
              </span>

              <q-btn
                flat
                dense
                round
                class="delete-btn"
                icon="close"
                @click="scope.removeFile(file)"
                v-if="!Field.ReadOnly"
              />
            </q-card>
          </div>
          <div
            class="input-field--error-tag"
            v-if="hasError"
          >
            <e-icon name="error"></e-icon>
          </div>
        </div>
      </template>
    </q-uploader>
    <q-dialog
      class="image-preview-dialog"
      flat
      full-width
      full-height
      v-model="showPreview"
      style="background: rgba(0,0,0,0)"
    >
      <div class="image-preview">
        <q-img
          v-if="previewType=== 'image'"
          contain
          :src="previewFile"
          @click="showPreview=false"
          style="height: 100%; max-width: 100%;"
        >
        </q-img>

        <q-pdfviewer
          v-if="previewType === 'pdf'"
          v-model="showPreview"
          @click="showPreview=false"
          @error="pdfError"
          @load="pdfLoad"
          :src="previewFile"
          type="pdfjs"
          style="height: 100%; max-width: 100%;"
        />
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldFile',
  mixins: [mixins.UploaderMixin, mixins.InputFieldMixin],
  emits:['input'],
  fieldInfo: {
    Category: 'Upload',
    Label: '文件',
    Value: 'File',
    Extra: [
      {
        Type: 'String',
        Label: '支持的文件类型',
        Name: 'Options.Ext',
        Default: 'pdf,doc,docx',
      },
      {
        Type: 'String',
        Label: '最大文件大小',
        Name: 'MaxValue',
        Default: '10m',
      },
      {
        Type: 'Boolean',
        Label: '紧凑样式',
        Name: 'Options.Dense',
        Default: false,
      },
      {
        Type: 'Boolean',
        Label: '显示为链接',
        Name: 'Options.AsLink',
        Default: false,
      },
    ],
    Description: '',
  },
  data() {
    return {
      hasError: false,
    };
  },
  computed: {
    dense() {
      return (
        !!this.Field
        && (!!this.Field.dense
          || (!!this.Field.Options && !!this.Field.Options.Dense))
      );
    },
  },
  watch: {
    fieldData() {
      if (this.fieldData) {
        try {
          this.$refs.uploader.files = typeof this.fieldData === 'string'
            ? [JSON.parse(this.fieldData)]
            : [this.fieldData];
        } catch (ex) {
          //
        }
      }
    },
  },
  mounted() {
    if (this.fieldData) {
      try {
        this.$refs.uploader.files = typeof this.fieldData === 'string'
          ? [JSON.parse(this.fieldData)]
          : [this.fieldData];
      } catch (ex) {
        //
      }
    }
  },
  methods: {
    validate() {
      if (this.Field.Required) {
        this.hasError = this.$refs.uploader.files.length <= 0;
        return this.$refs.uploader.files.length > 0;
      }

      const rules = Array.isArray(typeof this.Field.Rules)
        ? this.Field.Rules
        : [this.Field.Rules];

      let isValid = true;
      for (let i = 0; i < rules.length; i += 1) {
        const r = rules[i];

        if (typeof r === 'function') {
          isValid = isValid && r(this.$refs.uploader.files);
        }
      }

      this.hasError = !isValid;
      return isValid;
    },
    factoryFn() {
      return {
        url: this.Field.url || `${this.ctx.config.baseUrl}/upload`,
        fieldName: 'file',
      };
    },
    // fileAdded(files) {
    //   this.$refs.uploader.files = files;
    // },
    pdfLoad() {
      //
    },
    pdfError() {
      //
    },
    uploaded(info) {
      if (info && info.files && info.files.length && info.files[0].xhr) {
        const { xhr } = info.files[0];
        let res;
        if (xhr.response) {
          if (typeof xhr.response === 'string') {
            //
            res = JSON.parse(xhr.response);
          } else if (typeof xhr.response === 'object') {
            //
            res = xhr.response;
          } else {
            //
            return;
          }

          if (res && res.msg === 'OK') {
            // this.fieldData = JSON.stringify({
            //   id: res.data.id,
            //   // eslint-disable-next-line no-underscore-dangle
            //   sizeLabel: info.files[0].__sizeLabel,
            //   name: info.files[0].name,
            //   size: info.files[0].size,
            //   type: info.files[0].type,
            // });

            this.fieldData = {
              id: res.data.id,
              date: res.data.date || new Date(),
              // eslint-disable-next-line no-underscore-dangle
              sizeLabel: info.files[0].__sizeLabel,
              name: info.files[0].name,
              size: info.files[0].size,
              type: info.files[0].type,
            };

            this.$emit('input');
          }
        }

        this.validate();
      }
    },
  },
});
</script>

<style lang="sass" scoped>
.file-link
  &>div
    display: inline-block
    white-space: nowrap
    overflow: hidden
  & a
    white-space: nowrap
    overflow: hidden
</style>

<style lang="sass">
.q-uploader__header
  display: none
</style>
