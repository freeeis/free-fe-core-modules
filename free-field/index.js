import fields from './Fields';
import layout from './Layout';
import FreeField from './composible/fieldWrapper.js';

export default {
  components: {
    FreeField
  },
  fieldComponents: {
    ...fields,
    ...layout,
  },
};
