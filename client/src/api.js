// in client/src/api.js

import axios from 'axios';

// یک نمونه (instance) از axios با تنظیمات پایه می‌سازیم
const api = axios.create({
  baseURL: 'http://localhost:5000', // آدرس پایه سرور شما
});

// اینجا جادو اتفاق می‌افتد: Interceptor (رهگیر درخواست)
api.interceptors.request.use(
  (config) => {
    // قبل از اینکه درخواست ارسال شود، این تابع اجرا می‌شود
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    if (userInfo) {
      // اگر کاربر لاگین بود، توکن را به هدر اضافه کن
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    
    return config; // درخواست را برای ارسال برگردان
  },
  (error) => {
    // در صورت بروز خطا در تنظیم درخواست، آن را رد کن
    return Promise.reject(error);
  }
);

export default api;