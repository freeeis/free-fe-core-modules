<template>
  <div class="row free-field-file-list" v-if="Field">
    <span :class="`field-label ${(Field.Label && Field.Label.trim().length)
      ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`" v-if="Field.Label !== void 0">
      <q-tooltip v-if="Field.Description" anchor="top right">{{ Field.Description }}</q-tooltip>
      {{ Field.Label || '' }}
      <span v-if="Field.Required" class="required-mark">*</span>
    </span>
    <q-uploader @added="localFiles.push(...$event)" @uploaded="uploaded" @removed="removeFile" @rejected="filesRejected"
      :factory="factoryFn" multiple :auto-upload="Field && Field.Options && Field.Options.Auto"
      :max-file-size="maxFileSize" :max-total-size="maxTotalSize" :accept="acceptedFileTypes"
      :class="`q-ma-xs ${hasError ? 'free-field--error' : ''}`" ref="uploader">
      <template v-slot:list="scope">
        <div v-if="Field.Options && Field.Options.AsLink && Array.isArray(allFiles) && allFiles.length"
          class="file-link row full-width ellipsis items-center">
          <div class="row ellipsis full-width" v-for="(file, index) in allFiles || []" :key="index">
            <q-btn icon="cloud_download" dense flat></q-btn>
            <a class="ellipsis" target="_blank" :href="$filter('serverPath', file.id)" :download="file.name">
              {{ file.name }}
              <q-tooltip>{{ file.name }}</q-tooltip>
            </a>
          </div>
        </div>
        <div v-else>
          <div class="uploader-btns row no-wrap items-center">
            <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
            <q-btn v-if="scope.canAddFiles && !Field.ReadOnly && canHaveMore" type="a" icon="add_box" label="点击添加"
              class="add-btn" dense flat>
              <q-uploader-add-trigger v-if="!Field.ReadOnly" />
            </q-btn>
            <q-btn v-if="!Field.ReadOnly
              && scope.canUpload && !(Field && Field.Options && Field.Options.Auto)" type="a" icon="cloud_upload"
              @click="scope.upload" class="upload-btn" label="点击上传" dense flat></q-btn>

            <q-btn v-if="scope.isUploading && !Field.ReadOnly" type="a" icon="clear" @click="scope.abort"
              class="abort-btn" round dense flat></q-btn>
            <slot name="warning"></slot>
          </div>

          <!-- <div
            v-if="scope.files.length && Field.AsList"
            class="file-list file-list-list"
          >
            <q-list>
              <q-item
                class="file-list-item"
                v-for="(file, index) in scope.files"
                :key="index"
              >
                <span class="file-name full-width ellipsis">
                  <a
                    target="_blank"
                    :href="file.id | serverPath"
                    :download="file.name">
                      {{ file.name }}
                  </a>
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
              </q-item>
            </q-list>
          </div> -->

          <div v-if="Array.isArray(allFiles) && allFiles.length"
            class="file-list file-list-card row items-start justify-start q-gutter-xl">
            <q-card flat class="file-list-item" v-for="(file, index) in allFiles || []" :key="index">
              <e-icon class="file-image" :name="fileThumb(file)" thumb :relative="filePreviewType(file) !== 'image'"
                @click="preview(file)">
                <div class="view-btn-wrapper absolute-full justify-center text-center">
                  <q-btn flat class="view-btn full-height full-width">查看</q-btn>
                </div>
              </e-icon>
              <span class="file-name full-width ellipsis">
                <a target="_blank" :href="$filter('serverPath', file.id)" :download="file.name">
                  {{ file.name }}
                </a>
                <q-tooltip>{{ file.name }}</q-tooltip>
              </span>

              <span class="file-size full-width ellipsis">
                Size: {{ file.sizeLabel || file.__sizeLabel }}
              </span>

              <q-btn flat dense round class="delete-btn" icon="close" @click="scope.removeFile(file)"
                v-if="!Field.ReadOnly" />
            </q-card>
          </div>
          <div class="free-field--error-tag" v-if="hasError">
            <e-icon name="error"></e-icon>
          </div>
        </div>
      </template>
    </q-uploader>
    <q-dialog class="image-preview-dialog" flat full-width full-height v-model="showPreview"
      style="background: rgba(0,0,0,0)">
      <div class="image-preview">
        <q-icon name="close" class="absolute cursor-pointer bg-white text-primary"
          style="border-radius: 6px;border: 1px solid primary;right: 0;" round size="20px"
          @click="showPreview = false"></q-icon>
        <q-img v-if="previewType === 'image'" fit="contain" :src="previewFile" @click="showPreview = false"
          style="height: 100%; max-width: 100%;">
        </q-img>

        <pdf-viewer v-if="previewType === 'pdf'" v-model="showPreview" @click="showPreview = false" :src="previewFile"
          :version="Field?.Options?.PdfViewerVersion" type="pdfjs" style="height: 100%; max-width: 100%;" />
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { computed, defineComponent, getCurrentInstance, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField.js';
import { useFormValidator} from '../../composible/useFormValidator.js';
import { useUploader } from '../composible/useUploader.js';
import PdfViewer from './pdfviewer.js';

export default defineComponent({
  name: 'InputFieldFileList',
  fieldInfo: {
    Category: 'Upload',
    Label: '文件列表',
    Value: 'FileList',
    Extra: [
      {
        Type: 'String',
        Label: '支持的文件类型',
        Name: 'Options.Ext',
        Default: 'pdf,doc,docx',
      },
      {
        Type: 'Boolean',
        Label: '自动上传',
        Name: 'Options.Auto',
        Default: false,
      },
      {
        Type: 'String',
        Label: '最大文件大小',
        Name: 'MaxValue',
        Default: '10m',
      },
      {
        Type: 'String',
        Label: '最大总大小',
        Name: 'Options.MaxTotal',
        Default: '50m',
      },
      {
        Type: 'Number',
        Label: '最多文件个数',
        Name: 'Options.MaxCount',
        MinValue: 1,
        Options: {
          Postfix: '个',
        },
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
      {
        Type: 'String',
        Label: 'PDF查看器版本',
        Name: 'Options.PdfViewerVersion',
        Default: '',
      },
    ],
    Description: '',
  },
  components: {
    PdfViewer,
  },
  props: {
    ...freeFieldProps,
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
    const localFiles = ref([]);
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

      localFiles.value = localFiles.value.filter((f) => !info.files.includes(f));

      setFieldData([
        ...(fieldData.value || []),
        ...uploadedFiles
      ], emit);
      selfValidate();
    }

    const allFiles = computed(() => {
      // return [
      //   // ...fieldData.value || [],
      //   ...(uploader.value?.files || []),
      // ];

      return [].concat(fieldData.value || []).concat(localFiles.value)
    });


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
      localFiles,

      hasError,
      selfValidate,
      factoryFn,
      uploaded,
      allFiles,
      canHaveMore: computed(() => {
        if (!fieldData.value?.length) return true;
        if (!props.Field?.Options?.MaxCount) return true;

        return fieldData.value?.length < props.Field?.Options?.MaxCount;
      }),
      dense: computed(() => props.Field?.dense || props.Field?.Options?.Dense),
      removeFile: (files) => {
        localFiles.value = localFiles.value.filter((f) => !files.includes(f));
        setFieldData(fieldData.value.filter((f) => !files.includes(f)), emit);
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
