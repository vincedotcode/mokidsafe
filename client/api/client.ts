// src/api/ApiClient.ts
import BaseApi from './base';

const BASE_URL = 'http://localhost:5001/api'; 

const ApiClient = new BaseApi(BASE_URL);

export default ApiClient;
