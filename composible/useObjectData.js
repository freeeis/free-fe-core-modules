import { ref, unref, getCurrentInstance, nextTick, watch } from "vue";

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
  let latestRefreshBatchId = 0;

  watch(data, (v) => {
    ctx.emit('update:modelValue', v);
  });

  watch(() => props.modelValue, () => {
    data.value = props.modelValue;
  })

  const refreshData = (...args) => {
    const refreshBatchId = latestRefreshBatchId + 1;
    latestRefreshBatchId = refreshBatchId;

    // support multiple get data functions
    let hasMultipleGetData = false;

    const getDataList = [];
    if (Array.isArray(props.GetData)) {
      hasMultipleGetData = true;
      getDataList.push(...props.GetData);
    } else {
      getDataList.push(props.GetData);
    }

    const refreshTasks = getDataList.map((getData) => {
      if (typeof getData !== 'function') {
        return Promise.resolve(unref(getData));
      }

      return Promise.resolve()
        .then(() => getData(...args))
        .then((d) => unref(d));
    });

    return Promise.all(refreshTasks).then(async (results) => {
      if (refreshBatchId !== latestRefreshBatchId) {
        return results;
      }

      if (hasMultipleGetData) {
        results.forEach((result) => {
          Object.assign(data.value, result);
        });
      } else {
        data.value = results[0];
      }

      await nextTick();

      if (refreshBatchId === latestRefreshBatchId && typeof vm.afterRefresh === 'function') {
        vm.afterRefresh();
      }

      return results;
    });
  };

  if(props.modelValue) {
    data.value = props.modelValue;
  } else if (props.autoGet && props.GetData !== undefined && props.GetData !== null) {
    refreshData().catch(() => {});
  }

  return {
    data,
    refreshData,
  }
};

