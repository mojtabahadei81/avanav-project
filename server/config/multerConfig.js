// in server/config/multerConfig.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// مسیر پوشه آپلود را مشخص می‌کنیم
const uploadDir = path.join(__dirname, '..', 'uploads');

// اگر پوشه وجود نداشت، آن را می‌سازیم
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // فایل‌ها در پوشه server/uploads ذخیره شوند
  },
  filename: function (req, file, cb) {
    // برای جلوگیری از تداخل نام، نام اصلی فایل را حفظ می‌کنیم
    // در یک پروژه واقعی، بهتر است یک شناسه یکتا به نام فایل اضافه شود
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;