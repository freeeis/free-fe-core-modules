import { getErrorCode } from './api';

import { i18n } from '@/boot/i18n';
const {global:{t}} = i18n;

export default {
  list: (app) => () => ({
    GetData: (o) => getErrorCode(o).then((data) => {
      const d = (data && data.data) ? data.data : {};

      // add index
      if (d && d.total) {
        for (let i = 0; i < d.docs.length; i += 1) {
          const dc = d.docs[i];

          dc.index = (d.page - 1) * d.limit + i + 1;
        }
      }

      d.summary = [
        {
          text: t('代码数'),
          number: d.total || '0',
          number_color: 'red',
          icon: app.config.countIcon || 'fas fa-calculator',
        },
      ];

      return d;
    }),
  }),
};
