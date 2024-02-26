import axios, { AxiosError, AxiosResponse } from 'axios';

import { getIdToken } from '../context/authHelper';
import { router } from '../router/Routes';
import { toast } from 'react-toastify';

axios.defaults.baseURL =
  'https://7xfjmwdus0.execute-api.us-east-1.amazonaws.com/dev';

const responseBody = (response: any) => response;

axios.interceptors.request.use((config) => {
  const token = getIdToken()?.getJwtToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
  post: (url: string, body: object) =>
    axios
      .post(url, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(responseBody),
  put: (url: string, body: object) =>
    axios
      .put(url, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(responseBody),
  delete: (url: string) => axios.delete(url).then(responseBody),
  createForm: (url: string, data: FormData) =>
    axios
      .post(url, data, {
        headers: {
          'Content-type': 'multipart/form-data',
        },
      })
      .then(responseBody),
  putForm: (url: string, data: FormData) =>
    axios
      .put(url, data, {
        headers: {
          'Content-type': 'multipart/form-data',
        },
      })
      .then(responseBody),
};

const Admin = {
  getImage: (fileName: string) =>
    requests.get(`image`, new URLSearchParams({ fileName })),
  getHotels: () => requests.get(''),
  createHotel: (hotel: any) => requests.createForm('', createFormData(hotel)),
  updateHotel: (hotel: any) =>
    requests.putForm(`/${hotel.id}`, createFormData(hotel)),
};

const TestAPI = {
  get: () => requests.get(''),
  getbyId: (id: string) => requests.get(`/${id}`),
  post: (data: any) => requests.post('', data),
  put: (data: any) => requests.put('', data),
  delete: (id: string) => requests.delete(`/${id}`),
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
  TestAPI,
};
