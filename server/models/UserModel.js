// in backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // فیلدهای جدید جایگزین 'name' شده‌اند
    firstName: {
      type: String,
      required: [true, 'لطفا نام خود را وارد کنید'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'لطفا نام خانوادگی خود را وارد کنید'],
      trim: true,
    },
    // شماره تلفن به عنوان نام کاربری اصلی و یکتا
    phoneNumber: {
      type: String,
      required: [true, 'لطفا شماره تلفن خود را وارد کنید'],
      unique: true,
      trim: true,
    },
    // ایمیل دیگر اجباری نیست
    email: {
      type: String,
      unique: true,
      sparse: true, // این برای فیلدهای یکتای غیراجباری ضروری است
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // فیلد 'role' جایگزین 'isAdmin' شده است
    role: {
      type: String,
      required: true,
      enum: ['annotator', 'verifier', 'admin'], // فقط این مقادیر مجاز هستند
    },
    // فیلد جدید برای مدیریت وضعیت تایید کاربر
    status: {
      type: String,
      required: true,
      enum: ['pending', 'active'],
      default: 'pending',
    },
    // فیلد جدید برای اجبار به تغییر رمز عبور
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// --- این بخش‌ها بدون تغییر باقی می‌مانند ---

// متدی برای مقایسه رمز عبور وارد شده (بدون تغییر)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// قبل از ذخیره کردن، رمز عبور را هش کن (بدون تغییر)
userSchema.pre('save', async function (next) {
  // فقط زمانی رمز را هش کن که تغییر کرده باشد
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;