import { HotelURLs, S3URLs } from './baseURLs';
import axios, { AxiosError, AxiosResponse } from 'axios';

import { getIdToken } from '../context/authHelper';
import { router } from '../router/Routes';
import { toast } from 'react-toastify';

const URLS: HotelURLs = {
  HotelManagementURL:
    'https://7xfjmwdus0.execute-api.us-east-1.amazonaws.com/dev',
  HotelOrderURL:
    'https://3wimxn3oj2.execute-api.us-east-1.amazonaws.com/dev/hotel-order',
  HotelSearchURL: 'https://v0kqfsj6nc.execute-api.us-east-1.amazonaws.com/dev',
};

const S3URLS: S3URLs = {
  Hotel_Image_URL: 'https://hotel-booking-bucket-157.s3.amazonaws.com',
  // https://s3.us-east-1.amazonaws.com/hotel-booking-bucket-157
};

axios.defaults.baseURL = URLS.HotelManagementURL;

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

const Management = {
  getImage: (fileName: string) => {
    axios.defaults.baseURL = URLS.HotelManagementURL;
    return requests.get(`image`, new URLSearchParams({ fileName }));
  },
  getHotels: () => {
    axios.defaults.baseURL = URLS.HotelManagementURL;
    return requests.get('');
  },
  createHotel: (hotel: any) => {
    axios.defaults.baseURL = URLS.HotelManagementURL;
    return requests.createForm('', createFormData(hotel));
  },
  updateHotel: (hotel: any) => {
    axios.defaults.baseURL = URLS.HotelManagementURL;
    return requests.putForm(`/${hotel.id}`, createFormData(hotel));
  },
};

const Search = {
  searchHotels: (city: string, rating: string) => {
    axios.defaults.baseURL = URLS.HotelSearchURL;
    return requests.get(``, new URLSearchParams({ city, rating }));
  },
};

const Member = {
  getBookings: () => {
    axios.defaults.baseURL = URLS.HotelOrderURL;
    return requests.get('/booking');
  },
  getBooking: (id: string) => {
    axios.defaults.baseURL = URLS.HotelOrderURL;
    return requests.get(`/booking/${id}`);
  },
  createBooking: (booking: any) => {
    axios.defaults.baseURL = URLS.HotelOrderURL;
    return requests.post('/booking', booking);
  },
  updateBooking: (booking: any) => {
    axios.defaults.baseURL = URLS.HotelOrderURL;
    return requests.put('/booking', booking);
  },
  deleteBooking: (id: string) => {
    axios.defaults.baseURL = URLS.HotelOrderURL;
    return requests.delete(`/booking/${id}`);
  },
};

const createFormData = (item: any) => {
  const formData = new FormData();
  for (const key in item) {
    formData.append(key, item[key]);
  }
  return formData;
};

export const agent = {
  Management,
  Member,
  Search,
  S3URLS,
};
