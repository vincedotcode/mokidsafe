// src/api/BaseApi.ts
import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

class BaseApi {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
    });

    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = ""; 
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        // Handle request errors
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle response errors globally
        console.log(error)
        if (error.response) {
          console.error(
            `Response Error [${error.response.status}]: ${error.response.data.message || error.message}`
          );
        } else {
          console.error('Response Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // GET Request
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config);
  }

  // POST Request
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, config);
  }

  // PUT Request
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, config);
  }

  // DELETE Request
  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete<T>(url, config);
  }
}

export default BaseApi;
