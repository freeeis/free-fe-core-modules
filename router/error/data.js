// import Vue from 'vue';
import { getErrorCode } from './api';

// const bus = new Vue();

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
          text: '代码数',
          number: d.total || '0',
          number_color: 'red',
          icon: app.config.countIcon || 'fas fa-calculator',
        },
      ];

      return d;
    }),
    // Bus: bus,
  }),
};
