<template>
  <div class="row input-field-file-list combined input-field--readonly">
    <span
      :class="`field-label ${(Field.Label && Field.Label.trim().length)
        ? '' : 'field-label-empty'} ${Field.Required ? 'required' : ''}`"
      v-if="typeof Field.Label !== 'undefined'">
      <q-tooltip v-if="Field.Description" anchor="top right">{{Field.Description}}</q-tooltip>
      {{Field.Label || ''}}
    </span>
    <q-uploader
      multiple
      :class="`q-ma-xs`"
      ref="uploader"
    >
      <template v-slot:list="scope">
        <div v-if="scope.files.length && Field.AsList"
          class="file-list file-list-list">
          <q-list>
            <q-item
              class="file-list-item"
              v-for="(file, index) in scope.files" :key="index">
                <span class="file-name full-width ellipsis">
                  {{ file.name }}
                  <q-tooltip>{{ file.name }}</q-tooltip>
                </span>

                <span class="file-size full-width ellipsis">
                  Size: {{ file.sizeLabel || file.__sizeLabel }}
                </span>
            </q-item>
          </q-list>
        </div>

        <div v-if="scope.files.length && !Field.AsList"
          class="file-list file-list-card row items-start justify-start q-gutter-xl">
          <q-card
            flat
            class="file-list-item"
            v-for="(file, index) in scope.files" :key="index">
              <q-img class="file-image" :src="fileThumb(file)">
                <div class="view-btn-wrapper absolute-full justify-center text-center">
                  <q-btn
                    flat
                    class="view-btn full-height full-width"
                    @click="preview(file)"
                  >查看</q-btn>
                </div>
              </q-img>
              <span class="file-name full-width ellipsis">
                {{ file.name }}
                <q-tooltip>{{ file.name }}</q-tooltip>
              </span>

              <span class="file-size full-width ellipsis">
                Size: {{ file.sizeLabel || file.__sizeLabel }}
              </span>
          </q-card>
        </div>
      </template>
    </q-uploader>
    <q-dialog class="image-preview-dialog"
      flat
      full-width full-height v-model="showPreview"
      style="background: rgba(0,0,0,0)">
      <div class="image-preview">
        <q-img contain :src="previewFile"
          @click="showPreview=false"
          style="height: 100%; max-width: 100%;"></q-img>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import mixnins from 'free-fe-mixins';

export default defineComponent({
  name: 'InputFieldUltimateFile',
  mixins: [mixnins.UploaderMixin, mixnins.InputFieldMixin],
  fieldInfo: {
    Category: 'Upload',
    Label: '上传文件',
    Value: 'UltimateFile',
    Description: '',
  },
  watch: {
    fieldData() {
      if (this.fieldData) {
        this.$refs.uploader.files = this.fieldData;
      }
    },
  },
});
</script>

<style lang="sass">
.q-uploader__header
  display: none
</style>
