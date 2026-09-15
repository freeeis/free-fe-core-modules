import { reactive, getCurrentInstance, watchEffect, computed } from "vue";

export const freeFieldProps = {
  values: { type: Object },
  Field: { type: Object },
};

export function useFreeField(props, ctx) {
  const instance = getCurrentInstance();
  const { proxy:vm } = instance;
  const fieldData = reactive({});

  const valueToString = (value = fieldData.value) => {
    const formatter = instance.type?.valueToString;
    const formattedValue = typeof formatter === 'function'
      ? formatter.call(vm, value, props.Field, props.values)
      : value;

    if (formattedValue === void 0 || formattedValue === null) {
      return '';
    }

    return String(formattedValue);
  };

  watchEffect(() => {
    let realData = void 0;
    let usingDft = false;

    if (!props.Field) {
      return;
    }

    if (!props.Field.Name) {
      realData = props.Field.Value || props.Field.Default || void 0;
      usingDft = true;
    } else {
      if (props.Field.Info?.Dynamic && props.Field.Value !== void 0) {
        realData = props.Field.Value;
        usingDft = true;
      } else {
        realData = Object.nestValue(props.values, props.Field?.Name);
      }
    }

    // set to default if still undefined
    if ((realData === void 0 || realData === null) && ((props.Field.Value !== void 0) || (props.Field.Default !== void 0))) {
      realData = props.Field.Value || props.Field.Default;
      usingDft = true;

      // for non-dynamic field, which have refer data, we should save this data into the field
      if (props.Field.ReferTo && !props.Field.Info?.Dynamic) {
        ctx.emit('input');
      }
    }

    // filter data
    if (props.Field.Options && props.Field.Options.Filters) {
      let filters = [];
      if (typeof props.Field.Options.Filters === 'string') {
        // only one filter
        filters.push(props.Field.Options.Filters);
      } else if (Array.isArray(props.Field.Options.Filters)) {
        filters = filters.concat(props.Field.Options.Filters);
      }

      for (let i = 0; i < filters.length; i += 1) {
        const f = filters[i];
        realData = vm.$filter(f, realData)
      }
    }

    // // show NaN placeholder
    // TODO: return the placeholder here will not work as expected
    // if ((realData === void 0 || realData === null || realData === '') && props.Field?.Info?.ShowNaN) {
    //   return vm.ctx.config.nanPlaceholder || '';
    // }

    // if we are using a default value for this field, we should set the default value to the values object
    // so that we can get such value from anywhere else immediately
    if (usingDft) {
      Object.setValue(props.values, props.Field?.Name, props.Field.Value || props.Field.Default || void 0);
    }

    fieldData.value = realData;
  });

  const inputControlSettings = computed(() => {
    return vm.ctx.config['core-modules']?.inputControlSettings || {};
  });

  return {
    fieldData,
    valueToString,
    getFieldData: (n) => Object.nestValue(props.values, n),
    setFieldData: (v, emit, evt  = 'input') => {
      fieldData.value = v;
      Object.setValue(props.values, props.Field?.Name, v);

      if (emit) emit(evt, v);
    },
    setData: (n, v) => {
      Object.setValue(props.values, n, v);
    },
    inputControlSettings,
  }
};
