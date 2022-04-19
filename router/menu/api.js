// import Vue from 'vue';
import { requests } from 'boot/axios';

export function getMenus(p) {
  return requests.getRequest('menu', p ? {Parent: p} : {});
}

export function createMenu(data) {
  if (data.CustomizeRoute) {
    data.Route = data.CustomizeRoute;
  }
  return requests.postRequest('menu', data);
}

export function updateMenu(data) {
  if (data.CustomizeRoute) {
    data.Route = data.CustomizeRoute;
  }
  return requests.putRequest('menu', data);
}

export function deleteMenu(id) {
  return requests.deleteRequest('menu', { id });
}
