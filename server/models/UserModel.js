const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // هر ایمیل باید یکتا باشد
  },
  password: {
    type: String,
    required: true,
  },
  // در آینده می‌توانیم نقش ادمین را اینجا اضافه کنیم
  // isAdmin: { type: Boolean, required: true, default: false },
}, {
  timestamps: true,
});

// متدی برای مقایسه رمز عبور وارد شده با رمز عبور هش شده در دیتابیس
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// میدل‌ور Mongoose: قبل از ذخیره کردن کاربر جدید، رمز عبور را هش کن
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
