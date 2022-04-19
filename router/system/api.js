// import Vue from 'vue';
import { requests } from 'boot/axios';

export function getConfig (p) {
  return requests.getRequest('system', p ? { cat: p } : {});
}

export function updateConfig(o) {
  return requests.putRequest('system', o);
}
