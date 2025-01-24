// src/api/ApiClient.ts
import BaseApi from './base';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL + '/api';

console.log(BASE_URL)
if (!BASE_URL) {
  throw new Error('BASE_URL is not defined');
}

const ApiClient = new BaseApi(BASE_URL);

export default ApiClient;
