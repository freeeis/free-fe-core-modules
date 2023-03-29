import {
  getMenus,
  createMenu, updateMenu, deleteMenu,
} from './api';

const CHINA_NUMBERS = ' 一二三四五六七八九十';

export default {
  menu: () => ({
    GetData: (p, n, cat) => getMenus(p).then((d) => {
      const data = (d && d.data) ? d.data : {};
      const currentLevel = (n && n.level) ? n.level + 1 : 1;
      const menuList = [];
      if (data.total) {
        data.docs.forEach((o) => {
          o.lazy = true;
          o.level = currentLevel;

          if (p) {
            menuList.push(o);
          } else {
            const menuCat = menuList.find((m) => m.Label === o.Category);
            if (menuCat) {
              menuCat.children.push(o);
            } else {
              menuList.push({
                isCategory: true,
                Category: o.Category,
                id: o.Category,
                level: currentLevel - 1,
                Label: o.Category,
                children: [o],
              });
            }
          }
        });
      }

      // add the extra node for each level
      data.docs = menuList;
      if (p) {
        data.docs.push({
          addingNew: true,
          id: `label_${currentLevel}_new`,
          Label: `${CHINA_NUMBERS[currentLevel] || currentLevel}级`,
          level: currentLevel,
          Parent: p,
          Index: Infinity,
          Category: cat,
        });
      } else {
        data.docs.forEach((doc) => {
          doc.children.push({
            addingNew: true,
            id: `label_${currentLevel}_new`,
            Label: `${CHINA_NUMBERS[currentLevel] || currentLevel}级`,
            level: currentLevel,
            Parent: p,
            Index: Infinity,
            Category: doc.Category,
          });

          doc.children = doc.children.sort(
            (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
          );
        });
      }

      data.docs = data.docs.sort(
        (a, b) => (a ? a.Index : 0) - (b ? b.Index : 0),
      );

      data.total += 1;

      return data;
    }),
    addMenu: (d) => createMenu(d),
    editMenu: (d) => updateMenu(d),
    deleteMenu: (d) => deleteMenu(d),
  }),
};
