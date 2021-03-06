import { date } from 'quasar';
import config from '@/config';
import MsgDialog from './components/Dialog/index';

import EIcon from './components/Basic/EIcon.vue';
import StickyButtons from './components/StickyButtons';
import SelectLocales from './components/SelectLocales';
import SummaryHead from './components/Basic/SummaryHead.vue';
import SlidingCarousel from './components/SlidingCarousel/index.vue';
import SlidingNews from './components/SlidingNews/index.vue';
import FloatingWindow from './components/FloatingWindow/index.vue';
import LeveledMenus from './components/Basic/LeveledMenus.vue';
import BreadCrumbs from './components/Basic/BreadCrumbs.vue';
import ThemeSwitch from './components/ThemeSwitch/index.vue';

import FieldComponents from './field-components';
import FreeFields from './free-fields';
import routers from './router';

// Vue.component('EIcon', () => import('./components/Basic/EIcon.vue'));
// Vue.component('StickyButtons', () => import('./components/StickyButtons'));
// Vue.component('SelectLocales', () => import('./components/SelectLocales'));
// Vue.component('SummaryHead', () => import('./components/Basic/SummaryHead.vue'));
// Vue.component('SlidingCarousel', () => import('./components/SlidingCarousel/index.vue'));
// Vue.component('SlidingNews', () => import('./components/SlidingNews/index.vue'));
// Vue.component('FloatingWindow', () => import('./components/FloatingWindow/index.vue'));
// Vue.component('LeveledMenus', () => import('./components/Basic/LeveledMenus.vue'));
// Vue.component('BreadCrumbs', () => import('./components/Basic/BreadCrumbs.vue'));
// Vue.component('ThemeSwitch', () => import('./components/ThemeSwitch/index.vue'));

// global filters
const filters = {
  serverImage: url => (url ? `${config.imageUrlBase}${url}` : ''),
  serverVideo: url => (url ? `${config.videoUrlBase}${url}` : ''),
  serverThumb: url => (url ? `${config.thumbUrlBase}${url}` : ''),
  serverDocument: url => (url ? `${config.documentUrlBase}${url}` : ''),
  serverPath: (url) => {
    if (!url) return '';

    const dotIndex = url.lastIndexOf('.');
    const ext = url.substring(dotIndex, url.length).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.png':
      case '.jpeg':
      case '.bmp':
        return `${config.imageUrlBase}${url}`;
      case '.zip':
        return `${config.zipUrlBase}${url}`;
      case '.mp4':
        return `${config.videoUrlBase}${url}`;
      default:
        return `${config.documentUrlBase}${url}`;
    }
  },
  padding: (d, p = 2, c = '0') => {
    if (!d) d = '';

    for (let i = 0; i < (p - d.toString().length); i += 1) {
      d = `${c}${d}`;
    }

    return d;
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
    let date1 = new Date();
    let date2 = new Date(d);

    let diff = date.getDateDiff(date1, date2, 'seconds');
    if (diff < 1) {
      return diff + this.$t('justNow');
    } else if (diff < 60) {
      return diff + this.$t('secondsAgo');
    }

    diff = date.getDateDiff(date1, date2, 'minutes');
    if (diff < 60) {
      return diff + this.$t('minutesAgo');
    }

    if (diff < 24) {
      return diff + this.$t('hoursAgo');
    }

    diff = date.getDateDiff(date1, date2, 'days');
    if (diff < 31) {
      return diff + this.$t('daysAgo');
    }

    diff = date.getDateDiff(date1, date2, 'months');
    if (diff < 13) {
      return diff + this.$t('monthsAgo');
    }

    diff = date.getDateDiff(date1, date2, 'years');
    return diff + this.$t('yearsAgo');
  },
};

// export default {
//   config: {},
//   routers: [],
//   filters,
//   components
// }

export default (app, root) => {
  root.use(MsgDialog);

  return {
    config: {
      backendDependencies: ["core-modules"],
      dictFields: [
        {
          Type: "Category",
          Label: "??????????????????",
        },
        {
          Name: "Index",
          Label: "?????????",
          Type: "Number",
        },
        {
          Name: "Name",
          Label: "????????????",
          Type: "String",
        },
        {
          Name: "Label",
          Label: "????????????",
          Type: "String",
        },
        {
          Name: "Description",
          Label: "??????",
          Type: "Text",
        },
        {
          Name: "Type",
          Label: "??????",
          Type: "Select",
          Options: [
            {
              Label: "????????????",
              Value: "String",
            },
            {
              Label: "??????",
              Value: "File",
            },
          ],
        },
        {
          Name: "Value",
          Label: "???",
          Type: "String",
        },
        {
          Name: "Image",
          Label: "??????/??????/??????",
          Type: "File",
          MaxValue: "100m",
          Options: {
            Dense: false,
            AsLink: false,
            Ext: "jpg,png,pdf,doc,docx,zip",
          },
          Tips: [
            {
              Text: "??????????????????100M??????????????????PNG???JPG???PDF???DOC???DOCX???ZIP???",
            },
          ],
        },
        {
          Type: "Category",
          Label: "????????????",
        },
        {
          Name: "Info",
          Label: "????????????",
          Type: "Text",
        },
      ],
      menuFields: [
        {
          Type: "Category",
          Label: "????????????",
        },
        {
          Name: "Index",
          Label: "??????",
          Type: "Number",
        },
        {
          Name: "Label",
          Label: "????????????",
          Type: "String",
          Required: true,
        },
        {
          Name: "Icon",
          Label: "??????",
          Type: "String",
        },
        {
          Name: "Route",
          Label: "??????",
          Type: "Select",
          clearable: true,
          Options: [],
        },
        {
          Name: "Enabled",
          Label: "??????",
          Type: "Boolean",
        },
        {
          Name: "Description",
          Label: "??????",
          Type: "Text",
        },
        {
          Type: "Category",
          Label: "????????????",
        },
        {
          Name: "Permission",
          Label: "??????",
          Type: "Permission",
          ServiceList: "_service_list",
          NoDataScope: true,
        },
      ],
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
      ...FieldComponents.components,
      ...FreeFields,
      mourning: () => import("./view/mourning/mourning.vue"),
    },
    fieldComponents: FieldComponents.fieldComponents,

    validators: {
      validatorNotEmpty: (d) =>
        d !== undefined && d.length > 0 && d.trim().length > 0,
      validatorMobilePhone: (d) =>
        /^(0|86|17951)?(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])[0-9]{8}$/.test(
          d
        ),
      validatorEmail: (d) =>
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          d
        ),
      validatorPhoneOrEmail: (d) =>
        d !== undefined &&
        d.length > 0 &&
        (this.validatorPhone(d) || this.validatorEmail(d)),
      // validatorMinLength: (d, len = 0) => d !== undefined && d.length >= len,
      validatorChinaIDNumber: (d) =>
        /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(
          d
        ),
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
      validatorUrl: (d) =>
        /^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/.test(
          d
        ),
      validatorOfficePhone: (d) => /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}$/.test(d),
      validatorChinaZip: (d) => /^[1-9]{1}(\d+){5}$/.test(d),

      // password
      validatorPwd0: (d) => /^.*(?=.{6,16}).*$/.test(d),
      validatorPwd1: (d) => /^.{6,16}$/.test(d),
      validatorPwd2: (d) =>
        /^.*(?=.{6,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z]).*$/.test(d),
      validatorPwd3: (d) =>
        /^.*(?=.{6,16})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*?\(\)]).*$/.test(
          d
        ),
      validatorPwd4: (d) =>
        /^.*(?=.{6,16})(?=.*\d)(?=.*[A-Z]{2,})(?=.*[a-z]{2,})(?=.*[!@#$%^&*?\(\)]).*$/.test(
          d
        ),
    },
  }
};
