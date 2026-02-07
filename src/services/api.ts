import axios from 'axios';

const API_BASE_URL ='https://arline-unbalked-hiram.ngrok-free.dev/';

const api = axios.create({
  baseURL:API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;