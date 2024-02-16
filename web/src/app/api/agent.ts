import axios, { AxiosError, AxiosResponse } from 'axios';

import { router } from '../router/Routes';
import { toast } from 'react-toastify';

axios.defaults.baseURL =
  'https://51tvhlcm7g.execute-api.us-east-1.amazonaws.com/Test';
axios.defaults.withCredentials = true;

const responseBody = (response: any) => response;

// axios.interceptors.request.use((config) => {
//   const token = store.getState().account.user?.token;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

axios.interceptors.request.use((config) => {
  const headers = [
    'Content-Type',
    // 'X-Amz-Date',
    'Authorization',
    // 'X-Api-Key',
    // 'X-Amz-Security-Token',
    'Origin',
  ];
  headers.forEach((header) => {
    if (!config.headers[header]) {
      console.log(`${header} is not present in the request headers`);
    } else {
      console.log(`${header} is present in the request headers`);
    }
  });
  return config;
});

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { data, status } = error.response as AxiosResponse;
      switch (status) {
        case 400:
          toast.error(data.title);
          break;
        case 401:
          toast.error(data.title);
          break;
        case 404:
          toast.error(data.title);
          break;
        case 500:
          router.navigate('/server-error', { state: { error: data } });
          break;
        default:
          break;
      }
    } else {
      console.error('Server did not respond', error.message);
    }

    return Promise.reject(error.response as AxiosResponse);
  }
);

const requests = {
  get: (url: string, params?: URLSearchParams) =>
    axios.get(url, { params }).then(responseBody),
  post: (url: string, body: object) => axios.post(url, body).then(responseBody),
  put: (url: string, body: object) => axios.put(url, body).then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
  createForm: (url: string, data: FormData, idToken: string) =>
    axios
      .post(url, data, {
        headers: {
          Origin: 'http://localhost:3000',
          'Content-type': 'multipart/form-data',
          Authorization: `Bearer ${idToken}`,
        },
      })
      .then((response) => {
        console.log(response);
        return response;
      })
      .then(responseBody),
  putForm: (url: string, data: FormData, idToken: string) =>
    axios
      .put(url, data, {
        headers: {
          Origin: 'http://localhost:3000',
          'Content-type': 'multipart/form-data',
          Authorization: `Bearer ${idToken}`,
        },
      })
      .then(responseBody),
};

const Admin = {
  createHotel: (hotel: any, idToken: string) =>
    requests.createForm('', createFormData(hotel), idToken),
  updateHotel: (hotel: any, idToken: string) =>
    requests.putForm(`/${hotel.id}`, createFormData(hotel), idToken),
};

const createFormData = (item: any) => {
  const formData = new FormData();
  for (const key in item) {
    formData.append(key, item[key]);
  }
  return formData;
};

export const agent = {
  Admin,
};
