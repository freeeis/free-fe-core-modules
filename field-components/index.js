import fields from './Fields';
import display from './Display';
import FreeField from './components/FieldComponents.vue';

export default {
  components: {
    FreeField
  },
  fieldComponents: {
    ...fields,
    ...display,
  },
};
