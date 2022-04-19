import data from './data';

export default (app) => ([
  {
    path: 'errcode',
    component: () => import('../../view/error/list.vue'),
    props: data.list(app),
  },
]);
