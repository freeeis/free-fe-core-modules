<template>
  <div class="row free-field-image" v-if="Field">
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
      @removed="removeFile"
      @rejected="filesRejected"
      ref="uploader"
      :factory="factoryFn"
      auto-upload
      :max-file-size="maxFileSize"
      :class="(Field.dense ?
        `no-shadow dense` : `${Field.onlyIcon ? 'only-icon' : ''}`)
          + (hasError ? ' free-field--error' : '')"
    >
      <template v-slot:list="scope">
        <div class="uploader-btns row no-wrap items-center" v-if="!Field.dense && !(Field.onlyIcon || onlyIcon)">
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
          v-if="(Field.onlyIcon || onlyIcon) && (!fieldData.value || !fieldData.value || !fieldData.value.id)"
          type="a"
          :icon="fieldData?.value?.length ? 'check' : 'cloud_upload'"
          dense
          flat
          :disabled="Field.ReadOnly"
        >
          <q-uploader-add-trigger />
        </q-btn>

        <div v-else-if="(Field.onlyIcon || onlyIcon) && fieldData.value && fieldData.value?.id">
          <q-img
            :src="$filter(Field?.Options?.NoThumb ? 'serverImage' : 'serverThumb', `${fieldData.value.id}`)"
            style="width:32px; max-height:32px;min-height:32px;"
          >
          </q-img>
          <q-uploader-add-trigger/>
        </div>

        <q-item v-else-if="Field.dense" class="items-center q-pa-none">
          <q-item-section v-if="fieldData?.value?.length && fieldData.value.id" thumbnail>
            <q-img
              :src="`${ctx.config.thumbUrlBase}${fieldData.value.id}`"
              style="width: 48px; max-height: 48px;"
            >
            </q-img>
            <q-uploader-add-trigger v-if="!Field.ReadOnly" />
          </q-item-section>

          <q-item-section v-if="fieldData.value?.length && fieldData.value.__img" thumbnail class="gt-xs">
            <q-img :src="fieldData.value.__img.src">
            </q-img>
            <q-uploader-add-trigger v-if="!Field.ReadOnly" />
          </q-item-section>

          <q-item-section v-if="!fieldData.value?.length">
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

        <div v-else-if="Array.isArray(fieldData.value) && fieldData.value?.length" class="file-list row items-start justify-start">
          <q-card
            flat
            class="file-list-item"
            v-for="(file, index) in fieldData.value" :key="index">
              <e-icon class="file-image"
                :name="fileThumb(file)"
                :thumb="!Field?.Options?.NoThumb"
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
                :disabled="Field.ReadOnly"
              />
          </q-card>
        </div>

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
          fit="contain"
          v-if="previewType === 'image'"
          :src="previewFile"
          @click="showPreview=false"
          style="max-height: 100%; max-width: 100%;">
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
import { defineComponent, getCurrentInstance, ref } from 'vue';
import { useFreeField, freeFieldProps } from 'free-fe-core-modules/free-field/composible/useFreeField';
import { useFormValidator} from 'free-fe-core-modules/composible/useFormValidator';
import { useUploader } from 'free-fe-core-modules/free-field/composible/useUploader';

export default defineComponent({
  name: 'InputFieldImage',
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
      {
        Type: 'Boolean',
        Default: false,
        Label: '不使用缩略图',
        Name: 'Options.NoThumb',
      },
    ],
    Description: '',
  },
  props: {
    ...freeFieldProps,
    dense: { type: Boolean, default: false },
    onlyIcon: { type: Boolean, default: false },
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
        hasError.value = !!fieldData.value?.id;
        return !!fieldData.value?.id;
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
      // Image组件只允许一个图片
      const file = info.files[0];

      if (!file) return;

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
          setFieldData({
            id: res.data.id,
            // eslint-disable-next-line no-underscore-dangle
            sizeLabel: file.__sizeLabel,
            name: file.name,
            size: file.size,
            type: file.type,
          }, emit);
          selfValidate();
        }
      } else if (file.id) {
        // old files
        setFieldData(file, emit);
        selfValidate();
      }
    }

    const { validate } = useFormValidator();
    expose({
      validate,
    });

    return {
      fieldData,
      setFieldData,

      maxFileSize,
      maxTotalSize,
      acceptedFileTypes,
      fileThumb,
      filePreviewType,
      filePreview,
      filesRejected,
      preview,
      showPreview,
      previewType,
      previewFile,
      uploader,

      hasError,
      selfValidate,
      factoryFn,
      uploaded,

      removeFile: (files = []) => {
        setFieldData([], emit);
        selfValidate();

        uploader.value.files = uploader.value.files.filter((f) => {
          return files.findIndex((file) => file.name === f.name && file.size === f.size) < 0;
        });
      },
    };
  },
});
</script>

<style lang="sass">
.free-field-image
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
