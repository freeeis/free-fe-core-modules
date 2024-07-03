import { computed, getCurrentInstance, ref } from "vue";
import { Notify } from 'quasar';


function fileSizeStrToNumber (s) {
  if (!s) return undefined;

  const sizeMatch = s.match(/^([0-9]*)(k|m|g*)(b*)/);

  if (sizeMatch) {
    // eslint-disable-next-line no-unused-vars
    // const [tmp, num, unit] = sizeMatch;
    const num = sizeMatch[1];
    const unit = sizeMatch[2];
    if (!num || !Number(num)) return '';

    let multi = 1;
    switch (unit) {
      case 'k':
        multi = 1024;
        break;
      case 'm':
        multi = 1024 * 1024;
        break;
      case 'g':
        multi = 1024 * 1024 * 1024;
        break;
      default:
        multi = 1024;
        break;
    }

    return Number(num) * multi;
  }

  return undefined;
}

function fileSizeNumberToStr (s) {
  if (!s) return '0K';

  let sizeNum = Number(s) || 0;

  if (!sizeNum || sizeNum <= 0) return '0K';

  const unitList = ['B', 'K', 'M', 'G'];
  let unit = 'B';
  let unitIndex = 0;

  while (sizeNum > 1024) {
    if (unit === 'G') break;

    unitIndex += 1;
    unit = unitList[unitIndex];
    sizeNum /= 1024;
  }

  return `${sizeNum.toFixed(2)}${unit}`;
}

// eslint-disable-next-line no-underscore-dangle
function _getFileType (f) {
  if (!f) return {};

  if (f.type) {
    const fTypes = f.type.split('/');
    const [fType, fExt] = fTypes;
    return {
      fType, fExt,
    };
  }

  if (f.id) {
    let extname = f.id.substr(f.id.lastIndexOf('.'));
    if (extname.startsWith('.')) {
      extname = extname.substr(1);
    }

    extname = extname && extname.toLowerCase();

    switch (extname) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'bmp':
      case 'gif':
        return { fType: 'image', fExt: extname };
      case 'wav':
      case 'mp3':
        return { fType: 'audio', fExt: extname };
      case 'mp4':
        return { fType: 'video', fExt: extname };
      case 'txt':
        return { fType: 'text', fExt: extname };
      default:
        return { fType: 'application', fExt: extname };
    }
  }

  return {};
}

export function useUploader(props, ctx) {
  const { proxy:vm } = getCurrentInstance();

  const showPreview = ref(false);
  const previewFile = ref(undefined);
  const previewType = ref(undefined);

  const maxFileSize = computed(() => {
    return fileSizeStrToNumber(props.Field?.MaxValue || '10m') * 1.1;
  });

  const maxTotalSize = computed(() => {
    return fileSizeStrToNumber((props.Field?.Options?.MaxTotal) || '10m') * 1.1;
  });

  const acceptedFileTypes = computed(() => {
    if (!props.Field?.Options?.Ext) return '';

    const extList = props.Field.Options.Ext.split(',') || [];
    const typeList = [];

    const MIME_TYPE_LIST = {
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      bmp: 'image/bmp',
      doc: 'application/msword',
      docx:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      gif: 'image/gif',
      jpe: 'image/jpeg',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      mpeg: 'video/mpeg',
      pdf: 'application/pdf',
      ppt: 'application/vnd.ms-powerpoint',
      pptx:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      svg: 'image/svg+xml',
      txt: 'text/plain',
      wav: 'audio/x-wav',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      zip: 'application/zip',
    };

    extList.forEach((ext = '') => {
      if (!ext) return;
      let type = ext.trim().toLowerCase();
      type = MIME_TYPE_LIST[type];

      if (!ext.startsWith('.') && type && typeList.indexOf(type) < 0) typeList.push(type);
      if (ext.startsWith('.') && typeList.indexOf(ext) < 0) typeList.push(ext);
    });

    return typeList.join(',');
  });

  const fileThumb = computed(() => (file) => {
    const unknownType = 'insert_drive_file';
    if (!file) return unknownType;

    let type = '';
    // const fTypes = file.type.split('/');
    // const [fType, fExt] = fTypes;
    const { fType, fExt } = _getFileType(file);

    switch (fType) {
      case 'image':
        // eslint-disable-next-line no-underscore-dangle
        type = file.id || (file.__img ? file.__img.src : '');
        break;
      case 'audio':
        type = 'far fa-file-audio';
        break;
      case 'video':
        type = 'far fa-file-video';
        break;
      case 'text':
        type = 'far fa-file-text';
        break;
      case 'application':
        switch (fExt) {
          case 'doc':
          case 'docx':
          case 'msword':
          case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
            type = 'far fa-file-word';
            break;
          case 'xls':
          case 'xlsx':
          case 'vnd.ms-excel':
          case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            type = 'far fa-file-excel';
            break;
          case 'ppt':
          case 'pptx':
          case 'vnd.ms-powerpoint':
          case 'vnd.openxmlformats-officedocument.presentationml.presentation':
            type = 'far fa-file-powerpoint';
            break;
          case 'pdf':
            type = 'far fa-file-pdf';
            // type = 'insert_drive_file';
            break;
          case 'zip':
          case 'rar':
          case '7z':
          case 'x-zip-compressed':
            type = 'far fa-file-archive';
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }

    return type || unknownType;
  });

  const filePreviewType = computed(() => (file) => {
    if (!file) return '';

    // const fTypes = file.type.split('/');
    // const [fType, fExt] = fTypes;
    const { fType, fExt } = _getFileType(file);

    switch (fType) {
      case 'image':
        return 'image';
      case 'application':
        switch (fExt) {
          case 'doc':
          case 'docx':
          case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'word';
          case 'xls':
          case 'xlsx':
          case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'excel';
          case 'ppt':
          case 'pptx':
          case 'vnd.openxmlformats-officedocument.presentationml.presentation':
            return 'ppt';
          case 'pdf':
            return 'pdf';
          default:
            break;
        }
        break;
      default:
        break;
    }

    return '';
  });

  const filePreview = computed(() => (file) => {
    if (!file) return '';
    let url = '';

    const type = filePreviewType.value(file);
    switch (type) {
      case 'image':
        if (file.id) {
          url = vm.$filter('serverImage', file.id);
        } else {
          // eslint-disable-next-line no-underscore-dangle
          url = file.__img ? file.__img.src : '';
        }
        break;
      case 'pdf':
        if (file.id) {
          url = vm.$filter('serverDocument', file.id);
        }
        break;
      default:
        break;
    }

    return url;
  });

  return {
    showPreview,
    previewType,
    previewFile,
    maxFileSize,
    maxTotalSize,
    acceptedFileTypes,
    fileThumb,
    filePreviewType,
    filePreview,

    filesRejected (rejectedEntries) {
      // 忽略duplicate错误
      rejectedEntries = rejectedEntries.filter((entry) => entry.failedPropValidation !== 'duplicate');

      if (rejectedEntries && rejectedEntries.length > 0) {
        const fName = rejectedEntries[0] && rejectedEntries[0].file && rejectedEntries[0].file.name;
        const fSize = fileSizeNumberToStr(
          rejectedEntries[0] && rejectedEntries[0].file && rejectedEntries[0].file.size,
        );
        // TODO: i18n
        Notify.create({ message: `文件格式或大小不符合要求：${fName} （${fSize}）` });
      }
    },
    preview (file) {
      if (!file) return;

      previewType.value = filePreviewType.value(file);

      const url = filePreview.value(file);
      if (!url) {
        return;
      }

      previewFile.value = url;

      showPreview.value = true;
    },
  }
};
