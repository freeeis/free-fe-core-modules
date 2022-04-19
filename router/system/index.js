import data from './data';

export default [{
  path: 'system',
  component: () => import('../../view/system/index.vue'),
  props: data.systemConfig,
}];
