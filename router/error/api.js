// import Vue from 'vue';
import { requests } from 'boot/axios';

export function getErrorCode(o) {
  return requests.getRequest('error', o);
}

export function updateErrorCode(id, msg) {
  return requests.putRequest('error', { id, Message: msg });
}

export function updateDescription(id, desc) {
  return requests.putRequest('error', { id, Description: desc });
}
