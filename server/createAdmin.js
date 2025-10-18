// in server/createAdmin.js

const mongoose = require('mongoose');
const User = require('./models/UserModel');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ اتصال به MongoDB برقرار شد.');

    // بررسی اینکه آیا قبلاً ادمینی وجود دارد یا نه
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  یک ادمین قبلاً در سیستم وجود دارد:');
      console.log(`   نام: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   شماره تلفن: ${existingAdmin.phoneNumber}`);
      process.exit(0);
    }

    // ایجاد ادمین جدید
    const admin = await User.create({
      firstName: 'مدیر',
      lastName: 'سیستم',
      phoneNumber: '09123456789', // شماره تلفن ادمین (نام کاربری)
      email: 'admin@avanav.com',
      password: 'admin123', // رمز عبور اولیه
      role: 'admin',
      status: 'active',
      mustChangePassword: false, // ادمین نیازی به تغییر رمز ندارد
    });

    console.log('✅ ادمین با موفقیت ایجاد شد!');
    console.log('📋 اطلاعات ورود:');
    console.log(`   نام کاربری (شماره تلفن): ${admin.phoneNumber}`);
    console.log(`   رمز عبور: admin123`);
    console.log('\n⚠️  توجه: حتماً بعد از اولین ورود، رمز عبور را تغییر دهید!');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا در ایجاد ادمین:', error.message);
    process.exit(1);
  }
};

createAdmin();