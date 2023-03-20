import fields from './Fields';
import display from './Display';
import FreeField from './components/fieldWrapper.js';

export default {
  components: {
    FreeField
  },
  fieldComponents: {
    ...fields,
    ...display,
  },
};
