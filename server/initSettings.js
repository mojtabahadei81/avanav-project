// in server/initSettings.js

const mongoose = require('mongoose');
require('dotenv').config();
const Settings = require('./models/SettingsModel');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const initSettings = async () => {
  await connectDB();

  // بررسی اینکه آیا Settings وجود دارد یا نه
  const existingSettings = await Settings.findOne();

  if (!existingSettings) {
    // ایجاد Settings پیش‌فرض
    await Settings.create({
      annotationPrice: 700,
      verificationPrice: 700,
    });
    console.log('✅ Default settings created successfully!');
  } else {
    console.log('ℹ️ Settings already exist.');
  }

  process.exit();
};

initSettings();