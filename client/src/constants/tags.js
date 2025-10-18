// src/constants/tags.js

export const TAGS = {
  // === سن (۵ بازه) ===
  AGE_RANGE: {
    label: 'بازه سنی',
    options: [
      { value: '', label: 'انتخاب بازه سنی' },
      { value: 'child', label: '👶 کودک (0-12)' },
      { value: 'teen', label: '🧒 نوجوان (13-19)' },
      { value: 'young', label: '👨 جوان (20-35)' },
      { value: 'middle-aged', label: '👴 میانسال (36-55)' },
      { value: 'elderly', label: '👴 پیر (56+)' },
    ],
  },

  // === جنسیت ===
  GENDER: {
    label: 'جنسیت',
    options: [
      { value: '', label: 'انتخاب جنسیت' },
      { value: 'male', label: '👨 مرد' },
      { value: 'female', label: '👩 زن' },
    ],
  },

  // === لهجه (۹ گزینه) ===
  DIALECT: {
    label: 'لهجه',
    options: [
      { value: '', label: 'انتخاب لهجه' },
      { value: 'tehran', label: 'فارسی تهرانی' },
      { value: 'isfahan', label: 'فارسی اصفهانی' },
      { value: 'shiraz', label: 'فارسی شیرازی' },
      { value: 'mashhad', label: 'فارسی مشهدی' },
      { value: 'kerman', label: 'فارسی کرمانی' },
      { value: 'yazd', label: 'فارسی یزدی' },
      { value: 'kashan', label: 'فارسی کاشانی' },
      { value: 'bandari', label: 'فارسی بندری (جنوبی)' },
      { value: 'northern', label: 'فارسی شمالی' },
    ],
  },

  // === احساسات (۷ گزینه) ===
  EMOTION: {
    label: 'احساسات',
    options: [
      { value: '', label: 'انتخاب احساس' },
      { value: 'happy', label: '😊 شادی' },
      { value: 'sad', label: '😢 غم' },
      { value: 'angry', label: '😠 خشم' },
      { value: 'fear', label: '😨 ترس' },
      { value: 'surprise', label: '😲 تعجب' },
      { value: 'disgust', label: '😠 نفرت' },
      { value: 'neutral', label: '😐 خنثی' },
    ],
  },

  // === صدای پس‌زمینه (۷ گزینه) ===
  BACKGROUND_NOISE: {
    label: 'صدای پس‌زمینه',
    options: [
      { value: '', label: 'انتخاب صدای پس‌زمینه' },
      { value: 'none', label: '🔇 بدون پس‌زمینه' },
      { value: 'bird', label: '🐦 صدای پرنده' },
      { value: 'animals', label: '🐱 صدای حیوانات (گربه، سگ، و...)' },
      { value: 'traffic', label: '🚗 صدای ترافیک' },
      { value: 'wind', label: '💨 صدای باد' },
      { value: 'rain', label: '🌧️ صدای باران' },
      { value: 'music', label: '🎵 صدای موسیقی' },
      { value: 'other', label: '🔊 صدای دیگر' },
    ],
  },

  // === حاوی جملات رکیک (بله/خیر) ===
  PROFANITY: {
    label: 'حاوی جملات رکیک',
    options: [
      { value: '', label: 'انتخاب کنید' },
      { value: 'yes', label: 'بله ✅' },
      { value: 'no', label: 'خیر ❌' },
    ],
  },
};

// === تابع کمکی برای دریافت برچسب از مقدار ===
export const getTagLabel = (category, value) => {
  const options = TAGS[category]?.options || [];
  return options.find(opt => opt.value === value)?.label || value;
};

// === تابع کمکی برای دریافت تمام تگ‌های انتخاب شده ===
export const getSelectedTags = (task) => {
  const tags = [];
  
  if (task.dialect) tags.push({ category: 'DIALECT', value: task.dialect });
  if (task.emotion) tags.push({ category: 'EMOTION', value: task.emotion });
  if (task.backgroundNoise) tags.push({ category: 'BACKGROUND_NOISE', value: task.backgroundNoise });
  if (task.profanity) tags.push({ category: 'PROFANITY', value: task.profanity });
  
  return tags;
};