import { unref, getCurrentInstance, computed } from "vue";

export function useFormValidator(...list) {
  const { proxy:vm } = getCurrentInstance();

  return {
    validate: computed(() => {
      return (...args) => {
        if (vm.shouldHide) return true;
      
        // could have customized validate function in component
        if (vm.selfValidate && typeof vm.selfValidate === 'function') {
          return vm.selfValidate();
        }
      
        const refsList = [];
        for(let i = 0; i < list.length; i += 1) {
          if (typeof list[i] === 'string') {
            list[i] = vm.$refs[list[i]];
          } else if (typeof list[i] === 'function') {
            list[i] = list[i]();
          }
          
          if (Array.isArray(list[i])) {
            refsList.push(...list[i])
          } else {
            refsList.push(list[i])
          }
        }
  
        if (refsList.length <= 0) return true;
      
        let hasErr = false;
        for (let i = 0; i < refsList.length; i += 1) {
          let refi = unref(refsList[i]);


          const validFun = unref(refi.validate || refi.methods?.validate || refi.component?.exposed?.validate|| refi.component?.ctx?.validate);
          const shouldHide = unref(refi.shouldHide || refi.component?.ctx?.shouldHide);
      
          if (typeof validFun === 'function' && shouldHide !== true) {
            hasErr = !validFun() || hasErr;

            if (hasErr) {
              console.error('got error', args)
              break;
            }
          }
        }
      
        return !hasErr;
      };
    }),
  }
};

