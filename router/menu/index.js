import data from './data';

export default [{
  path: 'menu',
  component: () => import('../../view/menu/index.vue'),
  props: data.menu,
}];
