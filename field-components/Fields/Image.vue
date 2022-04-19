<template>
  <div class="row input-field-image">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.Label && !Field.dense">
      <q-tooltip v-if="Field.Description" anchor="top right">
        {{
        Field.Description
        }}
      </q-tooltip>
      {{ Field.Label || '' }}
      <span v-if="Field.Required" class="required-mark">*</span>
    </span>
    <q-uploader
      @uploaded="uploaded"
      @removed="
        fieldData = '';
        $emit('input');
      "
      @added="fileAdded"
      @rejected="filesRejected"
      ref="uploader"
      :factory="factoryFn"
      auto-upload
      :max-file-size="maxFileSize"
      :class="(Field.dense ?
        `no-shadow dense` : `${Field.onlyIcon ? 'only-icon' : ''}`)
          + (hasError ? ' input-field--error' : '')"
    >
      <template v-slot:list="scope">
        <div class="uploader-btns row no-wrap items-center" v-if="!Field.dense && !onlyIcon">
          <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
          <q-btn
            v-if="!scope.isUploading"
            type="a"
            icon="cloud_upload"
            dense
            flat
            class="upload-btn"
            label="点击上传"
            :disabled="Field.ReadOnly"
          >
            <q-uploader-add-trigger v-if="!Field.ReadOnly" />
          </q-btn>
          <q-btn
            v-if="scope.isUploading"
            icon="clear"
            @click="scope.abort"
            round
            class="clear-btn"
            dense
            flat
            :disabled="Field.ReadOnly"
          ></q-btn>
          <slot name="warning"></slot>
        </div>

        <q-btn
          v-if="onlyIcon && scope.files.length <= 0"
          type="a"
          :icon="scope.files.length ? 'check' : 'cloud_upload'"
          dense
          flat
          :disabled="Field.ReadOnly"
        >
          <q-uploader-add-trigger />
        </q-btn>
        <q-img
          v-if="onlyIcon && scope.files.length > 0"
          :src="runFilter('serverThumb',`${scope.files[0].id}`)"
          style="width: 32px; max-height: 32px;"
        >
          <q-uploader-add-trigger/>
        </q-img>

        <q-item v-else-if="Field.dense" class="items-center q-pa-none">
          <q-item-section v-if="scope.files.length && scope.files[0].id" thumbnail>
            <q-img
              :src="`${ctx.config.thumbUrlBase}${scope.files[0].id}`"
              style="width: 48px; max-height: 48px;"
            >
              <q-uploader-add-trigger v-if="!Field.ReadOnly" />
            </q-img>
          </q-item-section>

          <q-item-section v-if="scope.files.length && scope.files[0].__img" thumbnail class="gt-xs">
            <q-img :src="scope.files[0].__img.src">
              <q-uploader-add-trigger v-if="!Field.ReadOnly" />
            </q-img>
          </q-item-section>

          <q-item-section v-if="!scope.files.length">
            <q-btn
              v-if="!scope.isUploading"
              type="a"
              icon="cloud_upload"
              class="upload-btn"
              dense
              flat
              :disabled="Field.ReadOnly"
            >
              <q-uploader-add-trigger v-if="!Field.ReadOnly" />
            </q-btn>
          </q-item-section>
        </q-item>

        <div v-else-if="scope.files.length" class="file-list row items-start justify-start">
          <q-card
            flat
            class="file-list-item"
            v-for="(file, index) in scope.files" :key="index">
              <e-icon class="file-image" :name="fileThumb(file)" thumb
                :relative="filePreviewType(file) !== 'image'"
                @click="preview(file)">
                <div class="view-btn-wrapper absolute-full justify-center text-center">
                  <q-btn
                    flat
                    class="view-btn full-height full-width"
                    @click="preview(file)"
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
                :disabled="Field.ReadOnly"
              />
          </q-card>
        </div>

        <div class="input-field--error-tag" v-if="hasError">
          <e-icon name="error"></e-icon>
        </div>
      </template>
    </q-uploader>
    <q-dialog class="image-preview-dialog"
      flat
      full-width full-height v-model="showPreview"
      style="background: rgba(0,0,0,0)">
      <div class="image-preview">
        <q-img
          v-if="previewType=== 'image'"
          contain :src="previewFile"
          @click="showPreview=false"
          style="height: 100%; max-width: 100%;">
        </q-img>

        <q-pdfviewer
          v-if="previewType === 'pdf'"
          v-model="showPreview"
          @click="showPreview=false"
          :src="previewFile"
          type="pdfjs"
          style="height: 100%; max-width: 100%;"
        />
      </div>
    </q-dialog>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import mixnins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldImage',
  mixins: [mixnins.UploaderMixin, mixnins.InputFieldMixin],
  emits:['input'],
  fieldInfo: {
    Category: 'Upload',
    Label: '图片',
    Value: 'Image',
    Extra: [
      {
        Type: 'String',
        Label: '支持的文件类型',
        Name: 'Options.Ext',
        Default: 'jpg,png,bmp',
      },
      {
        Type: 'String',
        Label: '最大文件大小',
        Name: 'MaxValue',
        Default: '10m',
      },
    ],
    Description: '',
  },
  props: {
    dense: { type: Boolean, default: false },
    onlyIcon: { type: Boolean, default: false },
  },
  data() {
    return {
      hasError: false,
    };
  },
  watch: {
    fieldData() {
      if (this.fieldData) {
        try {
          this.$refs.uploader.files = (typeof this.fieldData === 'string') ? [JSON.parse(this.fieldData)] : [this.fieldData];
        } catch (ex) {
          //
        }
      }
    },
  },
  mounted() {
    if (this.fieldData) {
      try {
        this.$refs.uploader.files = (typeof this.fieldData === 'string') ? [JSON.parse(this.fieldData)] : [this.fieldData];
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

      const rules = Array.isArray(typeof this.Field.Rules) ? this.Field.Rules : [this.Field.Rules];

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
    fileAdded(files) {
      this.$refs.uploader.files = files;
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
              // eslint-disable-next-line no-underscore-dangle
              sizeLabel: info.files[0].__sizeLabel,
              name: info.files[0].name,
              size: info.files[0].size,
              type: info.files[0].type,
            };

            this.$emit('input');
          }
        }
      }

      this.validate();
    },
  },
});
</script>

<style lang="sass">
.input-field-image
  .only-icon
    text-align: center
    width: 32px
    .q-btn
      max-width: 32px
    .q-uploader__header
      display: none
    .q-uploader__list
      min-height: 32px
      padding: 0
</style>
