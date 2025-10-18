// in server/models/SettingsModel.js

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    annotationPrice: {
      type: Number,
      default: 700, // قیمت پیش‌فرض برای هر اصلاح (تومان)
    },
    verificationPrice: {
      type: Number,
      default: 700, // قیمت پیش‌فرض برای هر تایید (تومان)
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;