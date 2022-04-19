import data from './data';

export default [{
  path: 'dict',
  component: () => import('../../view/dict/index.vue'),
  props: data.dict,
}];
