<template>
  <div class="row free-field-file" v-if="Field">
    <span :class="`field-label ${(Field.Label && Field.Label.trim().length)
      ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`" v-if="Field.Label !== void 0">
      <q-tooltip v-if="Field.Description" anchor="top right">{{ Field.Description }}</q-tooltip>
      {{ Field.Label || '' }}
      <span v-if="Field.Required" class="required-mark">*</span>
    </span>

    <q-uploader @uploaded="uploaded" @removed="removeFile" @rejected="filesRejected" ref="uploader" :factory="factoryFn"
      auto-upload :max-file-size="maxFileSize" :accept="acceptedFileTypes"
      :class="`q-ma-xs ${hasError ? 'free-field--error' : ''}`">
      <template v-slot:list="scope">
        <div v-if="Field.Options && Field.Options.AsLink && !!fieldData.value?.id"
          class="file-link row full-width ellipsis items-center">
          <div class="row ellipsis full-width" v-for="(file, index) in fieldData.value" :key="index">
            <q-btn icon="cloud_download" dense flat></q-btn>
            <a class="ellipsis" target="_blank" :href="$filter('serverPath', file.id)" :download="file.name">
              {{ file.name }}
              <q-tooltip>{{ file.name }}</q-tooltip>
            </a>
          </div>
        </div>
        <div v-else>
          <div class="uploader-btns row no-wrap items-center" v-if="!dense">
            <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
            <q-btn v-if="!scope.isUploading && !Field.ReadOnly" type="a" icon="cloud_upload" dense flat
              class="upload-btn" label="点击上传">
              <q-uploader-add-trigger v-if="!Field.ReadOnly" />
            </q-btn>
            <q-btn v-if="scope.isUploading && !Field.ReadOnly" icon="clear" @click="scope.abort" class="clear-btn" round
              dense flat></q-btn>
            <slot name="warning"></slot>
          </div>

          <q-item v-if="dense && fieldData.value?.id">
            <q-item-section v-if="fieldData.value?.id && fieldData.value.name">
              <q-item-label class="full-width ellipsis">
                {{ fieldData.value.name }}
                <q-tooltip>{{ fieldData.value.name }}</q-tooltip>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn v-if="!scope.isUploading && !Field.ReadOnly" type="a" icon="cloud_upload" class="upload-btn" dense
                flat>
                <q-uploader-add-trigger v-if="!Field.ReadOnly" />
              </q-btn>
            </q-item-section>
          </q-item>

          <div v-else-if="!!fieldData.value?.id" class="file-list row items-start justify-start">
            <q-card flat class="file-list-item">
              <e-icon class="file-image" :name="fileThumb(fieldData.value)" thumb
                :relative="filePreviewType(fieldData.value) !== 'image'" @click="preview(fieldData.value)">
                <div class="view-btn-wrapper absolute-full justify-center text-center">
                  <q-btn flat class="view-btn full-height full-width">查看</q-btn>
                </div>
              </e-icon>
              <span class="file-name full-width ellipsis">
                <a v-if="fieldData.value && fieldData.value.id" target="_blank"
                  :href="$filter('serverPath', fieldData.value.id)" :download="fieldData.value.name">
                  {{ fieldData.value.name }}
                </a>
                <span v-else-if="fieldData.value && fieldData.value.name">
                  {{ fieldData.value.name }}
                </span>
                <q-tooltip>{{ fieldData.value.name }}</q-tooltip>
              </span>

              <span class="file-size full-width ellipsis">
                Size: {{ fieldData.value.sizeLabel || fieldData.value.__sizeLabel }}
              </span>

              <q-btn flat dense round class="delete-btn" icon="close" @click="scope.removeFile(fieldData.value)"
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
import { useRoute } from 'vue-router';
import { useFreeField, freeFieldProps } from '../composible/useFreeField.js';
import { useFormValidator} from '../../composible/useFormValidator.js';
import { useUploader } from '../composible/useUploader.js';
import PdfViewer from './pdfviewer.js';

function parseStaticResourceParams(paramStr, route) {
  if (!paramStr || paramStr.trim().length <= 0) {
    return '';
  }

  let finalParamStr = paramStr || '';

  const paramList = paramStr.match(/\{[^\}]+\}/g);
  const paramValuesMap = {};
  for (let i = 0; i < paramList.length; i += 1) {
    const varItem = paramList[i];
    if (paramValuesMap[varItem]) {
      continue;
    }

    const varName = varItem.replace('{', '').replace('}', '');
    const varValue = Object.nestValue(route, varName) || '';

    console.log('varName, varValue', varName, varValue);

    finalParamStr = finalParamStr.replace(new RegExp(varItem, 'g'), varValue);

    paramValuesMap[varItem] = 1;
  }

  return finalParamStr;
}

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
      {
        Type: 'String',
        Label: 'PDF查看器版本',
        Name: 'Options.PdfViewerVersion',
        Default: '',
      },
      {
        Type: 'String',
        Label: '可访问来源',
        Name: 'Options.staticResourceReferers',
        Placeholder: '逗号分隔的来源列表，支持正则表达式。比如：/admin/f/case/{params.id}/(2|3|4|5)',
        Default: '',
      },
      {
        Type: 'String',
        Label: '所需权限',
        Name: 'Options.staticResourcePerms',
        Placeholder: '逗号分隔的API路径列表，不支持正则表达式！比如：/api/case/{params.id}/2/view,/api/case/{params.id}/3/view',
        Default: '',
      },
    ],
    Description: '',
  },
  components: {
    PdfViewer,
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
        hasError.value = !fieldData.value?.id;
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

    const route = useRoute();
    const factoryFn = () => {
      // 静态资源访问权限控制
      const {staticResourcePerms, staticResourceReferers} = props.Field.Options || {};

      return {
        url: props.Field.url || `${vm.ctx.config.baseUrl}/upload`,
        fieldName: 'file',
        formFields: [
          {
            name: 'perms',
            value: parseStaticResourceParams(staticResourcePerms, route) || '',
          },
          {
            name: 'refs',
            value: parseStaticResourceParams(staticResourceReferers, route) || '',
          }
        ],
      };
    };

    const uploaded = (info) => {
      // File组件只允许一个文件
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
