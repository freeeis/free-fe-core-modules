<template>
  <div class="row free-field-file-list combined free-field--readonly" v-if="Field">
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
    </span>
    <q-uploader
      multiple
      :class="`q-ma-xs`"
      ref="uploader"
    >
      <template v-slot:list>
        <div
          v-if="fieldData.value?.length && Field.AsList"
          class="file-list file-list-list"
        >
          <q-list>
            <q-item
              class="file-list-item"
              v-for="(file, index) in fieldData.value"
              :key="index"
            >
              <span class="file-name full-width ellipsis">
                <a
                  target="_blank"
                  :href="$filter('serverPath', file.id)"
                  :download="file.name">
                    {{ file.name }}
                </a>
                <q-tooltip>{{ file.name }}</q-tooltip>
              </span>

              <span class="file-size full-width ellipsis">
                Size: {{ file.sizeLabel || file.__sizeLabel }}
              </span>
            </q-item>
          </q-list>
        </div>

        <div
          v-if="fieldData.value?.length && !Field.AsList"
          class="file-list file-list-card row items-start justify-start q-gutter-xl"
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
                target="_blank"
                :href="$filter('serverPath', file.id)"
                :download="file.name">
                  {{ file.name }}
              </a>
              <q-tooltip>{{ file.name }}</q-tooltip>
            </span>

            <span class="file-size full-width ellipsis">
              Size: {{ file.sizeLabel || file.__sizeLabel }}
            </span>
          </q-card>
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
          :src="previewFile"
          type="pdfjs"
          style="height: 100%; max-width: 100%;"
        />
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { computed, defineComponent, ref } from 'vue';
import { useFreeField, freeFieldProps } from '../composible/useFreeField';
import { useUploader } from '../composible/useUploader';

export default defineComponent({
  name: 'InputFieldFileListCombined',
  fieldInfo: {
    Category: 'Upload',
    Label: '合并文件列表',
    Value: 'FileListCombined',
    Description: '',
  },
  props: {
    ...freeFieldProps,
  },
  setup(props) {
    const { fieldData, setFieldData } = useFreeField(props);
    const {
      showPreview,
      previewType,
      previewFile,
      fileThumb,
      filePreviewType,
      filePreview,
      preview,
    } = useUploader(props);

    const uploader = ref(null);

    return {
      fieldData,
      setFieldData,

      showPreview,
      previewType,
      previewFile,
      fileThumb,
      filePreviewType,
      filePreview,
      preview,
      uploader,

      dense: computed(() => props.Field?.dense || props.Field?.Options?.Dense),
    };
  },
});
</script>
