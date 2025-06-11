import { getCurrentInstance } from 'vue';
import { date as quasarDate } from 'quasar';
import config from '@/config';
// import useAppStore from '@/stores/app';
import MsgDialog from './components/Dialog/index';

import EIcon from './components/Basic/EIcon.vue';
import StickyButtons from './components/StickyButtons/index.vue';
import SelectLocales from './components/SelectLocales/index.vue';
import SummaryHead from './components/Basic/SummaryHead.vue';
import SlidingCarousel from './components/SlidingCarousel/index.vue';
import SlidingNews from './components/SlidingNews/index.vue';
import FloatingWindow from './components/FloatingWindow/index.vue';
import LeveledMenus from './components/Basic/LeveledMenus.vue';
import BreadCrumbs from './components/Basic/BreadCrumbs.vue';
import ThemeSwitch from './components/ThemeSwitch/index.vue';

import Mourning from './view/mourning/mourning.vue';

import FieldComponents from './free-field';
import routers from './router';

// global filters
const filters = {
  serverImage: (url) => {
    if (typeof url === 'string' && url.startsWith('@')) return url.substring(1);

    return url ? `${config.imageUrlBase}${url}` : '';
  },
  serverVideo: (url) => {
    if (typeof url === 'string' && url.startsWith('@')) return url.substring(1);

    return url ? `${config.videoUrlBase}${url}` : '';
  },
  serverThumb: (url) => {
    if (typeof url === 'string' && url.startsWith('@')) return url.substring(1);

    return url ? `${config.thumbUrlBase}${url}` : '';
  },
  serverDocument: (url) => {
    if (typeof url === 'string' && url.startsWith('@')) return url.substring(1);

    return url ? `${config.documentUrlBase}${url}` : '';
  },
  serverPath: (url) => {
    if (!url) return '';
    if (typeof url === 'string' && url.startsWith('@')) return url.substring(1);

    const dotIndex = url.lastIndexOf('.');
    const ext = url.substring(dotIndex, url.length).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.png':
      case '.jpeg':
      case '.bmp':
      case '.gif':
        return `${config.imageUrlBase}${url}`;
      case '.zip':
      case '.rar':
      case '.7z':
      case '.tar':
      case '.gz':
      case '.bz2':
      case '.xz':
      case '.tgz':
        return `${config.zipUrlBase}${url}`;
      case '.mp4':
      case '.avi':
      case '.mov':
      case '.wmv':
      case '.flv':
      case '.mkv':
        return `${config.videoUrlBase}${url}`;
      case '.doc':
      case '.docx':
      case '.xls':
      case '.xlsx':
      case '.pdf':
        return `${config.documentUrlBase}${url}`;
      default:
        return `${config.videoUrlBase}${url}`;
    }
  },
  padding: (d, p = 2, c = '0') => {
    if (!d) d = '';

    const fullStr = `${Array.from({length: p}, () => c).join('')}${d.toString()}`;

    return fullStr.substring(fullStr.length - p, fullStr.length);
  },
  normalDate: (d) => {
    if (!d) return '';

    // compat with safari which is not supporting data format like '2020-01-01 00:00:00'
    const dt = new Date(d);
    const date = (!dt || !dt.valueOf()) ? new Date(d.replace(/-/g, '/')) : dt;
    if (!date || !date.valueOf()) return '';

    return `${date.getFullYear()}-${filters.padding((date.getMonth() || 0) + 1)}-${filters.padding((date.getDate()))}`;
  },
  wanYuan: (d) => {
    if (!d) return 0;

    const numVal = Number(d);
    if (numVal) {
      return (numVal / 10000.0).toFixed(2);
    }

    return d;
  },
  dateAndTime: (d) => {
    if (!d) return '';

    const dt = new Date(d);
    const date = (!dt || !dt.valueOf()) ? new Date(d.replace(/-/g, '/')) : dt;
    if (!date || !date.valueOf()) return '';

    return `${date.getFullYear()}-${filters.padding((date.getMonth() || 0) + 1)}-${filters.padding((date.getDate()))} ${filters.padding(date.getHours())}:${filters.padding(date.getMinutes())}`;
  },
  dateYearMonth: (d, sep = '-') => {
    if (!d) return '';

    const dt = new Date(d);
    const date = (!dt || !dt.valueOf()) ? new Date(d.replace(/-/g, '/')) : dt;
    if (!date || !date.valueOf()) return '';

    return `${date.getFullYear()}${sep}${filters.padding((date.getMonth() || 0) + 1)}`;
  },
  dateDay: (d) => {
    if (!d) return '';

    const dt = new Date(d);
    const date = (!dt || !dt.valueOf()) ? new Date(d.replace(/-/g, '/')) : dt;
    if (!date || !date.valueOf()) return '';

    return filters.padding((date.getDate()));
  },
  ago: (d) => {
    const date1 = new Date();
    const date2 = new Date(d);
    const { proxy:vm } = getCurrentInstance();

    let diff = quasarDate.getDateDiff(date1, date2, 'seconds');
    if (diff < 1) {
      return vm.$t('justNow');
    }
    if (diff < 60) {
      return diff + vm.$t('secondsAgo');
    }

    diff = quasarDate.getDateDiff(date1, date2, 'minutes');
    if (diff < 60) {
      return diff + vm.$t('minutesAgo');
    }

    if (diff < 24) {
      return diff + vm.$t('hoursAgo');
    }

    diff = quasarDate.getDateDiff(date1, date2, 'days');
    if (diff < 31) {
      return diff + vm.$t('daysAgo');
    }

    diff = quasarDate.getDateDiff(date1, date2, 'months');
    if (diff < 13) {
      return diff + vm.$t('monthsAgo');
    }

    diff = quasarDate.getDateDiff(date1, date2, 'years');
    return diff + vm.$t('yearsAgo');
  },
  stepCaption: (step, status, data) => {
    if (!step) return '';
    if (step && typeof step.Description === 'string') return step.Description;

    let desc = '';
    if (step && Array.isArray(step.Description)) {
      let stepStatus;
      if (data && data.Steps) {
        const rStep = data.Steps[step.Index];
        if (rStep) {
          stepStatus = rStep.Status;
        }
      }
      desc = step.Description.find((s) => s.Status === (status || stepStatus || '').toString());
      desc = desc ? desc.Description : '';
    }

    desc = desc || '未知状态';
    return desc;
  },
};

export default (app, root) => {
  root.use(MsgDialog);

  // const appStore = useAppStore();

  const validatorMobilePhone = (d) => !d || /^(0|86|17951)?(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])[0-9]{8}$/.test(d);
  const validatorEmail = (d) => !d || /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(d);
  return {
    config: {
      backendDependencies: ["core-modules"],
      dictFields: [{
          Type: 'Category',
          Label: '字典数据信息',
        },
        {
          Name: 'Index',
          Label: '排序号',
          Type: 'Number',
        },
        {
          Name: 'Name',
          Label: '数据名称',
          Type: 'String',
        },
        // {
        //   Name: 'Label',
        //   Label: '显示名称',
        //   Type: 'String',
        // },
        // {
        //   Name: 'Description',
        //   Label: '说明',
        //   Type: 'Text',
        // },
        {
          Name: 'Labels',
          Type: 'Tabs',
          Label: '显示内容',
          DataType: 'Array',
          Default: config.locales.map((l) => ({
            Locale: l.locale,
            Name: l.name,
            Label: '',
            Description: '',
          })),
          Options: {
            Dense: true,
            LabelField: 'Name',
            ValueField: 'Locale',
            Fields: [{
                Name: 'Locale',
                Label: '语言',
                Type: 'String',
                ReadOnly: true,
              },
              {
                Name: 'Label',
                Label: '显示名称',
                Type: 'String',
              },
              {
                Name: 'Description',
                Label: '说明',
                Type: 'Text',
              },
            ],
          },
        },
        {
          Name: 'Type',
          Label: '类型',
          Type: 'Select',
          Options: [{
            Label: '普通类型',
            Value: 'String',
          }, {
            Label: '文件',
            Value: 'File',
          }],
        },
        {
          Name: 'Value',
          Label: '值',
          Type: 'String',
        },
        {
          Name: 'Image',
          Label: '图片/图标/文件',
          Type: 'File',
          MaxValue: '100m',
          Options: {
            Dense: false,
            AsLink: false,
            Ext: 'jpg,png,pdf,doc,docx,zip'
          },
          Tips: [{
            Text: '文件不可超过100M。格式支持：PNG、JPG、PDF、DOC、DOCX、ZIP。',
          }],
        },
        {
          Type: 'Category',
          Label: '高级设置',
        },
        {
          Name: 'Info',
          Label: '附加信息',
          Type: 'Text',
        }
      ],
      menuFields: [{
          Type: "Category",
          Label: "菜单信息",
        },
        {
          Name: "Index",
          Label: "序号",
          Type: "Number",
        },
        {
          Name: "Label",
          Label: "菜单名称",
          Type: "String",
          Required: true,
        },
        {
          Name: "Icon",
          Label: "图标",
          Type: "String",
        },
        {
          Name: "Route",
          Label: "页面",
          Type: "Select",
          clearable: true,
          Options: [],
        },
        {
          Name: 'CustomizeRoute',
          Label: '自定义路径',
          Info: {
            ShowWhen: 'data.Route === "customize"',
          },
        },
        {
          Name: "Enabled",
          Label: "启用",
          Type: "Boolean",
          showLabel: true,
        },
        {
          Name: "Description",
          Label: "说明",
          Type: "Text",
        },
        {
          Type: "Category",
          Label: "权限配置",
        },
        {
          Name: "Permission",
          Label: "权限",
          Type: "Permission",
          ServiceList: "_service_list",
          NoDataScope: true,
        },
      ],

      defaultInputFieldPlaceholder: '',
      defaultSelectFieldPlaceholder: '',
      defaultSearchFieldPlaceholder: '',
    },
    routers,
    filters,
    components: {
      EIcon,
      StickyButtons,
      SelectLocales,
      SummaryHead,
      SlidingCarousel,
      SlidingNews,
      FloatingWindow,
      LeveledMenus,
      BreadCrumbs,
      ThemeSwitch,
      Mourning,
      ...FieldComponents.components,
    },
    fieldComponents: FieldComponents.fieldComponents,

    validators: {
      validatorNotEmpty: (d) => d !== void 0 && d.length > 0 && d.trim().length > 0,
      validatorMobilePhone,
      validatorEmail,
      validatorPhoneOrEmail: (d) => d !== void 0 && d.length > 0 && (validatorMobilePhone(d) || validatorEmail(d)),
      // validatorMinLength: (d, len = 0) => d !== undefined && d.length >= len,
      validatorChinaIDNumber: (d) => !d || /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(d),
      // validatorSame: (d, to) => d === to,
      // validatorDifferent: (d, to) => d !== to,
      // validatorGT: (d, to) => d > to,

      validatorOnlyNumber: (d) => /^\d+$/.test(d),
      validatorOnlyChar: (d) => /^[a-zA-Z]+$/.test(d),
      validatorOnlyUpChar: (d) => /^[A-Z]+$/.test(d),
      validatorOnlyLowerChar: (d) => /^[a-z]+$/.test(d),
      validatorOnlyChinese: (d) => /^[\u4E00-\u9FA5]+$/.test(d),
      validatorOnlyCC: (d) => /^[\u4E00-\u9FA5a-zA-Z]+$/.test(d),
      validatorOnlyCCN: (d) => /^[\u4E00-\u9FA5a-zA-Z0-9]+$/.test(d),
      validatorOnlyCN: (d) => /^[a-zA-Z0-9]+$/.test(d),
      validatorOnlyCNU: (d) => /^[a-zA-Z0-9_]+$/.test(d),
      // asdf2222.@<>_aSSS091.?<>
      validatorOnlyCNS: (d) => /^[a-zA-Z0-9u4e00-u9fa5.@]+$/.test(d),

      // number
      validatorOnlyInteger: (d) => /^([0]|-?[1-9][0-9]+)$/.test(d.toString()),
      validatorOnlyPI: (d) => /^([1-9][0-9]+)$/.test(d.toString()),
      validatorOnlyPIZ: (d) => /^([0]|[1-9][0-9]+)$/.test(d.toString()),
      validatorOnlyNI: (d) => /^(-[1-9][0-9]+)$/.test(d.toString()),
      validatorOnlyNIZ: (d) => /^([0]|-[1-9][0-9]+)$/.test(d.toString()),

      //
      validatorUrl: (d) => /^(ht|f)tp(s?):\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-.?,'/\\+&amp;%$#_]*)?/.test(d),
      validatorOfficePhone: (d) => /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}$/.test(d),
      validatorChinaZip: (d) => /^[1-9]{1}(\d+){5}$/.test(d),

      // password
      validatorPwd0: (d) => /^.*(?=.{6,16}).*$/.test(d),
      validatorPwd1: (d) => /^.{6,16}$/.test(d),
      validatorPwd2: (d) => /^.*(?=.{6,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*$/.test(d),
      validatorPwd3: (d) => /^.*(?=.{6,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*?()]).*$/.test(d),
      validatorPwd4: (d) => /^.*(?=.{6,16})(?=.*\d)(?=.*[A-Z]{2,})(?=.*[a-z]{2,})(?=.*[!@#$%^&*?()]).*$/.test(d),
    },
  }
};
