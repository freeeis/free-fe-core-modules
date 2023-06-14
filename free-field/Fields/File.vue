<template>
  <div class="row free-field-file" v-if="Field">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.Label !== void 0"
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
      @removed="removeFile"
      @rejected="filesRejected"
      ref="uploader"
      :factory="factoryFn"
      auto-upload
      :max-file-size="maxFileSize"
      :accept="acceptedFileTypes"
      :class="`q-ma-xs ${hasError ? 'free-field--error' : ''}`"
    >
      <template v-slot:list="scope">
        <div
          v-if="Field.Options && Field.Options.AsLink && Array.isArray(fieldData.value) && fieldData.value?.length"
          class="file-link row full-width ellipsis items-center"
        >
          <div
            class="row ellipsis full-width"
            v-for="(file, index) in fieldData.value"
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
              :href="$filter('serverPath', file.id)"
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

          <q-item v-if="dense && fieldData.value?.length">
            <q-item-section v-if="fieldData.value?.length && fieldData.value[0].name">
              <q-item-label class="full-width ellipsis">
                {{ fieldData.value[0].name }}
                <q-tooltip>{{ fieldData.value[0].name }}</q-tooltip>
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
            v-else-if="Array.isArray(fieldData.value) && fieldData.value?.length"
            class="file-list row items-start justify-start"
          >
            <q-card
              flat
              class="file-list-item"
              v-for="(file, index) in fieldData.value"
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
                  :href="$filter('serverPath', file.id)"
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
            class="free-field--error-tag"
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
        <q-icon name="close"
          class="absolute cursor-pointer bg-white text-primary"
          style="border-radius: 6px;border: 1px solid primary;right: 0;"
          round size="20px"
          @click="showPreview=false"></q-icon>
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
import { computed, defineComponent, getCurrentInstance, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';
import { useUploader } from '../composible/useUploader';

export default defineComponent({
  name: 'InputFieldFile',
  props: {
    ...freeFieldProps,
  },
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
  emits: ['input'],
  setup(props, { expose, emit }) {
    const { proxy:vm } = getCurrentInstance();
    const { fieldData, setFieldData } = useFreeField(props);
    const {
      showPreview,
      previewType,
      previewFile,
      maxFileSize,
      maxTotalSize,
      acceptedFileTypes,
      fileThumb,
      filePreviewType,
      filePreview,
      filesRejected,
      preview,
    } = useUploader(props);

    const uploader = ref(null);
    const hasError = ref(false);

    const selfValidate = () => {
      if (props.Field?.Required) {
        hasError.value = fieldData.value?.length <= 0;
        return fieldData.value?.length > 0;
      }

      const rules = Array.isArray(typeof props.Field.Rules) ? props.Field.Rules : [props.Field.Rules];

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

    const factoryFn = () => {
      return {
        url: props.Field.url || `${vm.ctx.config.baseUrl}/upload`,
        fieldName: 'file',
      };
    };

    const uploaded = (info) => {
      const uploadedFiles = [];
      for (let i = 0; i < info.files.length; i += 1) {
        const file = info.files[i];

        const { xhr } = file;
        let res;
        if (xhr && xhr.response) {
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
            uploadedFiles.push({
              id: res.data.id,
              // eslint-disable-next-line no-underscore-dangle
              sizeLabel: file.__sizeLabel,
              name: file.name,
              size: file.size,
              type: file.type,
            });
          }
        } else if (file.id) {
          // old files
          uploadedFiles.push(file);
        }
      }

      console.log('uploadedFiles', uploadedFiles);

      setFieldData(uploadedFiles, emit);
      selfValidate();
    }

    const { validate } = useFormValidator();
    expose({
      validate,
    });

    return {
      fieldData,
      setFieldData,

      showPreview,
      previewType,
      previewFile,
      maxFileSize,
      maxTotalSize,
      acceptedFileTypes,
      fileThumb,
      filePreviewType,
      filePreview,
      filesRejected,
      preview,
      uploader,

      hasError,
      selfValidate,
      factoryFn,
      uploaded,
      dense: computed(() => props.Field?.dense || props.Field?.Options?.Dense),
      removeFile: () => {
        setFieldData([], emit);
        selfValidate();
      },
    };
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
