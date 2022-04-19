// import Vue from 'vue';
import { getConfig } from './api';

// const bus = new Vue();

export default {
  systemConfig: () => ({
    GetData: (o) => getConfig(o).then((d) => {
      const data = (d && d.data) ? d.data : {};

      data.StepsDefinition = [];
      data.docs = data.docs || [];
      for (let i = 0; i < data.docs.length; i += 1) {
        const doc = data.docs[i];

        doc.Type = 'String';
        doc.Label = doc.Name;
        doc.Name = 'Value';

        const def = data.StepsDefinition.find((df) => !!df && df.Name === doc.Category);
        if (def) {
          def.Fields = def.Fields || [];
          def.Fields.push({ ...doc, ...doc.Field || {} });
          delete doc.Field;
        } else {
          data.StepsDefinition.push({
            Name: doc.Category,
            Index: i + 1,
            Actions: [
              {
                Label: '保存',
                Action: 'save',
              },
            ],
            Fields: [doc],
          });
        }
      }

      data.StepsDefinition.forEach((sd) => sd.Fields.sort((a, b) => a.Index - b.Index));

      return data;
    }),
    // Bus: bus,
  }),
};
