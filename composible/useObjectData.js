import { ref, unref, getCurrentInstance, watch, watchEffect } from "vue";

export const objectDataProps = {
  DefaultData: {},
  GetData: [Function, Object, Array],
  Bus: Object,
  modelValue: {},
  autoGet: { type: Boolean, default: true },
};

export function useObjectData(props, ctx) {
  const { proxy:vm } = getCurrentInstance();

  const data = ref(props.DefaultData || {});
  const callsLeft = ref(100);

  watch(data, (v) => {
    ctx.emit('update:modelValue', v);
  });

  watch(() => props.modelValue, () => {
    data.value = props.modelValue;
  })

  // call after refresh when all function got called
  watch(() => callsLeft.value, () => {
    if (typeof vm.afterRefresh === 'function' && callsLeft.value <= 0) {
      vm.afterRefresh();
    }
  })

  const refreshData = (...args) => {
    // support multiple get data functions
    const getDataList = [];
    if (Array.isArray(props.GetData)) {
      getDataList.push(...props.GetData);
    } else {
      getDataList.push(props.GetData);
    }

    callsLeft.value = getDataList.length;

    for (let i = 0; i < getDataList.length; i += 1) {
      const getData = getDataList[i];

      if (typeof getData === 'function') {
        Promise.resolve(getData(...args)).then((d) => {
          Object.assign(data.value, unref(d));
        }).finally(() => {
          callsLeft.value --;
        });
      } else {
        Object.assign(data.value, unref(getData));
        callsLeft.value --;
      }
    }
  };

  if(props.modelValue) {
    data.value = props.modelValue;
  } else if (props.autoGet) {
    refreshData();
  }

  return {
    data,
    refreshData,
  }
};

