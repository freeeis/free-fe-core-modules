import { reactive, watch, watchEffect } from "vue";

export const freeFieldProps = {
  values: { type: Object },
  Field: { type: Object },
};

export function useFreeField(props) {
  const fieldData = reactive({});

  watchEffect(() => {
    fieldData.value = Object.nestValue(props.values, props.Field?.Name);

    // TODO:following is from the old mixins, should we add more logic here accordingly?
    // let realData;
    // if (!this.Field) {
    //   // return undefined;
    // } else if (!this.Field.Name) {
    //   // this.fieldData = this.Field.Value || this.Field.Default || undefined;
    //   realData = this.Field.Value || this.Field.Default || undefined;
    // } else {
    //   let isnull = false;
    //   if (this.Field && this.Field.Info && this.Field.Info.Dynamic && this.Field.Value) {
    //     realData = this.Field.Value;
    //     isnull = typeof realData === 'undefined';
    //   } else {
    //     realData = this.data;

    //     if (this.Field.Name !== '.') {
    //       const nameList = this.Field.Name.split('.');

    //       for (let i = 0; i < nameList.length; i += 1) {
    //         const name = nameList[i];

    //         // if (!realData) return undefined;
    //         if (typeof realData === 'undefined' || realData === null) {
    //           isnull = true;
    //           break;
    //         } else {
    //           realData = name ? realData[name] : realData;
    //         }
    //       }
    //     }
    //   }

    //   if (!isnull) {
    //     // for non-dynamic field, which have refer data, we should save this data into the field
    //     if ((typeof realData === 'undefined') && (this.Field.Value || this.Field.Default)) {
    //       realData = this.Field.Value || this.Field.Default;

    //       if (this.Field && this.Field.ReferTo && (!this.Field.Info || !this.Field.Info.Dynamic)) {
    //         this.$emit('input');
    //       }
    //     }

    //     // realData = (typeof realData === 'undefined') ? (this.Field.Value || this.Field.Default) : realData;

    //     if (this.Field.Options && this.Field.Options.Filters) {
    //       let filters = [];
    //       if (typeof this.Field.Options.Filters === 'string') {
    //         // only one filter
    //         filters.push(this.Field.Options.Filters);
    //       } else if (Array.isArray(this.Field.Options.Filters)) {
    //         filters = filters.concat(this.Field.Options.Filters);
    //       }

    //       for (let i = 0; i < filters.length; i += 1) {
    //         const f = filters[i];
    //         const filter = this.$options.filters[f];
    //         if (filter) {
    //           realData = filter(realData);
    //         }
    //       }
    //     }
    //   }
    // }

    // if ((typeof realData === 'undefined' || realData === null || !realData) && this.Field.Info && this.Field.Info.ShowNaN) {
    //   return this.ctx.config.nanPlaceholder || '';
    // }

    // return realData;
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
