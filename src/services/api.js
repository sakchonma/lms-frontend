import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// ดึง Token จาก LocalStorage มาใส่ใน Header ทุกครั้งที่ยิง API
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('lms_token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
