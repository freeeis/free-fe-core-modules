// import Vue from 'vue';
import { requests } from 'boot/axios';

export function getDict (p) {
  return requests.getRequest('dict', p ? { Parent: p } : {});
}

export function createDict (data) {
  return requests.postRequest('dict', data);
}

export function updateDict (data) {
  return requests.putRequest('dict', data);
}

export function deleteDict (id) {
  return requests.deleteRequest('dict', { id });
}
