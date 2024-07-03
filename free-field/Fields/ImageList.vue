<template>
  <div class="row free-field-image-list" v-if="Field">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="Field.Label !== void 0">
      <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
      {{Field.Label || ''}}
      <span v-if="Field.Required" class="required-mark">*</span>
    </span>
    <q-uploader
      @added="localFiles.push(...$event)"
      @uploaded="uploaded"
      @removed="removeFile"
      @rejected="filesRejected"
      :factory="factoryFn"
      multiple
      :max-files="Field.Options && Field.Options.MaxCount"
      :max-file-size="maxFileSize"
      :max-total-size="maxTotalSize"
      :class="`q-ma-xs ${hasError ? 'free-field--error' : ''}`"
      ref="uploader"
    >
      <template v-slot:list="scope">
        <div class="uploader-btns row no-wrap items-center">
          <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
          <q-btn
            v-if="scope.canAddFiles"
            type="a"
            icon="add_box"
            label="点击添加"
            class="add-btn"
            dense
            flat
            :disabled="Field.ReadOnly"
          >
            <q-uploader-add-trigger v-if="!Field.ReadOnly"/>
          </q-btn>
          <q-btn
            v-if="scope.canUpload"
            icon="cloud_upload"
            @click="scope.upload"
            class="upload-btn"
            label="点击上传"
            dense
            flat
            :disabled="Field.ReadOnly"
          ></q-btn>

          <q-btn
            v-if="scope.isUploading"
            icon="clear"
            @click="scope.abort"
            class="abort-btn"
            round
            dense
            flat
            :disabled="Field.ReadOnly"
          ></q-btn>
          <slot name="warning"></slot>
        </div>

        <div v-if="Array.isArray(allFiles) && allFiles.length" class="file-list row items-start justify-start q-gutter-xl">
          <q-card
            flat
            class="file-list-item"
            v-for="(file, index) in allFiles" :key="index">
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
                {{ file.name }}
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
        <!-- <q-list separator v-if="scope.files.length">
          <q-item>
            <q-item-section v-for="(file, index) in scope.files" :key="index">
              <q-item-label class="full-width ellipsis">
                {{ file.name }}
                <q-tooltip>{{ file.name }}</q-tooltip>
              </q-item-label>

              <q-item-label caption>Size: {{ file.sizeLabel || file.__sizeLabel }}</q-item-label>

              <q-item-section v-if="file.__img" thumbnail class="gt-xs">
                <img :src="file.__img.src" />
              </q-item-section>
              <q-item-section v-if="file.id" thumbnail class="gt-xs">
                <img :src="`${ctx.config.thumbUrlBase}${file.id}`" />
              </q-item-section>

              <q-item-section side>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="delete"
                  @click="scope.removeFile(file)"
                  :disabled="Field.ReadOnly"
                />
              </q-item-section>
            </q-item-section>
          </q-item>
        </q-list> -->
        <!-- <div v-else class="text-center">no file selected yet</div> -->
        <div class="free-field--error-tag" v-if="hasError">
          <e-icon name="error"></e-icon>
        </div>
      </template>
    </q-uploader>
    <q-dialog class="image-preview-dialog"
      flat
      full-width full-height v-model="showPreview"
      style="background: rgba(0,0,0,0)">
      <div class="image-preview">
        <q-icon name="close"
          class="absolute cursor-pointer bg-white text-primary"
          style="border-radius: 6px;border: 1px solid primary;right: 0;"
          round size="20px"
          @click="showPreview=false"></q-icon>
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
import { computed, defineComponent, getCurrentInstance, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useFormValidator} from '../../composible/useFormValidator';
import { useUploader } from '../composible/useUploader';

export default defineComponent({
  name: 'InputFieldImageList',
  fieldInfo: {
    Category: 'Upload',
    Label: '图片列表',
    Value: 'ImageList',
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
      {
        Type: 'String',
        Label: '最大总大小',
        Name: 'Options.MaxTotal',
        Default: '50m',
      },
    ],
    Description: '',
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
      removeFile: (files = []) => {
        localFiles.value = localFiles.value.filter((f) => !files.includes(f));
        setFieldData(fieldData.value.filter((f) => !files.includes(f)), emit);
        selfValidate();

        uploader.value.files = uploader.value.files.filter((f) => {
          return files.findIndex((file) => file.name === f.name && file.size === f.size) < 0;
        });
      },
    };
  },
});
</script>
