import { reactive, watch, watchEffect } from "vue";

export const freeFieldProps = {
  values: { type: Object },
  Field: { type: Object },
};

export function useFreeField(props) {
  const fieldData = reactive({});

  watchEffect(() => {
    fieldData.value = Object.nestValue(props.values, props.Field?.Name);
  });

  return {
    fieldData,
    getFieldData: (n) => Object.nestValue(props.values, n),
    setFieldData: (v, emit, evt  = 'input') => {
      fieldData.value = v;
      Object.setValue(props.values, props.Field?.Name, v);

      if (emit) emit(evt, v);
    },
    setData: (n, v) => {
      Object.setValue(props.values, n, v);
    },
  }
};


// TODO: make function for validating all fields in the current component
function validate() {
  if (this.shouldHide) return true;

  // could have customized validate function in component
  if (this.selfValidate && typeof this.selfValidate === 'function' && !this.selfValidate()) {
    return false;
  }

  const validators = Object.keys(this.$refs).filter((k) => k.startsWith('input_field_validator_'));
  if (!validators || validators.length <= 0) {
    return true;
  }

  let hasError = false;
  for (let i = 0; i < validators.length; i += 1) {
    const valid = validators[i];

    if (this.$refs[valid]) {
      if (Array.isArray(this.$refs[valid])) {
        for (let j = 0; j < this.$refs[valid].length; j += 1) {
          const sv = this.$refs[valid][j];

          if (sv.shouldHide !== true) {
            if (typeof sv.validate === 'function') {
              hasError = !sv.validate() || hasError;
            }
          }
        }
      } else if (typeof this.$refs[valid].validate === 'function') {
        if (this.$refs[valid].shouldHide !== true) {
          hasError = !this.$refs[valid].validate() || hasError;
        }
      }
    }
  }

  return !hasError;
};

export const useFreeFieldMethods = {
  validate,
};
