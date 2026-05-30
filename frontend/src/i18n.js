import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uz: {
    translation: {
      "common": {
        "menu": "Menyu", "dashboard": "Dashboard", "statistics": "Statistika", "profile": "Profil",
        "settings": "Sozalamalar", "help": "Yordam", "admin": "Boshqaruv", "logout": "Chiqish",
        "back": "Orqaga", "save": "Saqlash", "cancel": "Bekor qilish", "loading": "Yuklanmoqda...",
        "active": "Faol", "offline": "Oflayn", "uzbek": "O'zbekcha", "russian": "Русский",
        "dark_mode": "Tungi mavzu", "light_mode": "Kunduzgi mavzu", "all_rights_reserved": "Barcha huquqlar himoyalangan.",
        "error_occurred": "Xatolik yuz berdi", "retry": "Qayta urinish"
      },
      "levels": {
        "beginner": "Boshlang'ich", "learner": "O'rganuvchi", "intermediate": "O'rtacha",
        "advanced": "Yuqori", "expert": "Ekspert", "master": "Usta"
      },
      "quiz": {
        "ball": "ball", "next_level_label": "Keyingi darajaga", "ball_left": "ball qoldi",
        "streak": "ketma-ket", "best": "eng yaxshi", "start_quiz": "Boshlash", "next": "Keyingi"
      },
      "stats": {
        "title": "Sizning natijalaringiz", "subtitle": "O'z yutuqlaringizni kuzatib boring",
        "total_questions": "Jami savollar", "correct_answers": "To'g'ri javoblar", "wrong_answers": "Xato javoblar",
        "accuracy": "Aniqlik", "current_streak": "Hozirgi rekord", "best_streak": "Eng yaxshi rekord",
        "results": "Natijalar", "total_time": "Jami sarflangan vaqt", "seconds": "soniya",
        "current_level": "Hozirgi daraja", "levels": "Darajalar tizimi", "points": "ball",
        "reset_stats": "Statistikani tozalash"
      },
      "profile": {
        "title": "Foydalanuvchi profili", "subtitle": "Shaxsiy ma'lumotlar",
        "user": "Foydalanuvchi", "topics_count": "Mavzular", "remaining_days": "Qolgan kunlar",
        "details_title": "Batafsil ma'lumot", "username": "Login", "registration_date": "Ro'yxatdan o'tilgan",
        "not_available": "Mavjud emas", "expiry_date": "Amal qilish muddati", "completed_topics": "Tugallangan mavzular",
        "admin_contact": "Admin bilan bog'lanish"
      },
      "dashboard": {
        "welcome": "Salom, {{name}}! 👋", "subtitle": "Haydovchilik guvohnomasi imtihoniga tayyorgarlik",
        "start_practice": "Mashq boshlash", "practice_desc": "Mavzular bo'yicha mashq qiling",
        "start_exam": "Imtihon boshlash", "exam_desc": "Haqiqiy imtihon muhitini his eting",
        "variants_count": "{{count}} ta variant", "questions_count": "{{count}} ta savol",
        "stat_topics": "Mavzular", "stat_questions": "Savollar", "stat_completed": "Tugallangan", "stat_avg_time": "O'rtacha vaqt",
        "select_topic": "Mavzuni tanlang", "no_topics": "Mavzular topilmadi"
      },
      "admin": {
        "title": "Boshqaruv markazi",
        "users_tab_desc": "Akkountlar va ruxsatlarni boshqarish",
        "questions_tab_desc": "Test savollari bazasini tahrirlash",
        "topics_tab_desc": "Mavzular bazasini tahrirlash",
        "admins_tab_desc": "Adminlar ro'yxati",
        "add_user": "Qo'shish", "add_question": "Yangi savol", "add_topic": "Yangi mavzu", "search": "Qidirish...",
        "add_answer": "Variant qo'shish",
        "tabs": { "users": "Foydalanuvchilar", "questions": "Savollar", "topics": "Mavzular", "statistics": "Statistika", "admins": "Adminlar" },
        "table": {
            "profile": "Profil", "login": "Login", "password": "Parol", "expiry": "Ruxsat muddati",
            "status": "Status", "actions": "Amallar", "question_text": "Savol matni",
            "topic": "Mavzu", "image": "Rasm", "topic_name": "Mavzu nomi",
            "description": "Tavsif", "questions_count": "Savollar"
        },
        "delete": {
            "title": "O'chirishni tasdiqlaysizmi?",
            "msg": "Ushbu ma'lumotni o'chirib tashlamoqchimisiz? Bu amalni qaytarib bo'lmaydi.",
            "confirm": "Ha, o'chirish"
        },
        "status": { "active": "Faol", "expired": "Muddati o'tgan" },
        "modal": { 
            "edit": "Tahrirlash", "add": "Yangi qo'shish", "first_name": "Ism", "last_name": "Familiya", 
            "admin_role": "Administrator", "correct_answer": "To'g'ri javob" 
        },
        "stats_view": {
            "user_status_title": "Foydalanuvchilar statusi", "overall_title": "Umumiy statistika",
            "total_users": "Jami foydalanuvchilar", "total_questions": "Jami savollar", "total_topics": "Jami mavzular", 
            "chart_title": "Savollar taqsimoti", "active_label": "Faol", "expired_label": "Muddati o'tgan", "questions_count": "Savollar soni"
        },
        "success": {
            "added": "Foydalanuvchi qo'shildi!",
            "copy_hint": "Ustiga bosib nusxa oling",
            "copied": "Nusxa olindi!",
            "copy_btn": "Nusxa olish"
        }
      },
      "settings": {
        "title": "Sozlamalar", "subtitle": "Ilovani o'zingizga moslang",
        "visual_section": "Vizual sozlamalar", "dark_mode": "Tungi mavzu", "theme_desc": "Ko'zingizni asrash uchun tungi rejimni yoqing",
        "font_size": "Shrift o'lchami", "pwa_section": "Ilova o'rnatish", "pwa_install_title": "Ilovani o'rnatish",
        "pwa_install_desc": "Tezkor kirish uchun ilovani asosiy ekranga qo'shing", "install_btn": "O'rnatish",
        "pwa_installed": "O'rnatilgan", "pwa_installed_desc": "Ilova allaqachon qurilmangizda mavjud",
        "security_section": "Xavfsizlik va ma'lumotlar", "reset_stats": "Statistikani tozalash",
        "reset_desc": "Barcha yutuqlar va natijalarni o'chirib tashlash", "reset_btn": "Tozalash",
        "reset_confirm_title": "Ishonchingiz komilmi?", "reset_confirm_desc": "Barcha statistika butunlay o'chiriladi.",
        "reset_clean_btn": "Tozalash"
      },
      "stats_keys": {
          "reset_confirm_title_short": "O'chirish"
      },
      "landing": {
        "title": "AvtoX SaaS", "subtitle": "O'z avtomaktabingizni 1 daqiqada oching", "create_btn": "Saytni Yaratish",
        "school_name": "Avtomaktab nomi", "placeholder_name": "Masalan: Avto-Lider",
        "username": "Subdomen (Username)", "placeholder_user": "masalan: lider",
        "upload_logo": "Logotip yuklash", "upload_hint": "PNG yoki JPG tavsiya etiladi",
        "tg_username": "Telegram username", "placeholder_tg": "@foydalanuvchi_nomi",
        "creating": "Yaratilmoqda...", "success": "Muvaffaqiyatli yaratildi!",
        "success_desc": "Platformangiz tayyor!", "view_site": "Saytni ko'rish",
        "admin_panel": "Admin panel", "create_another": "Yana yaratish"
      },
      "faq": {
        "title": "Ko'p beriladigan savollar", "subtitle": "Avto-lider platformasi haqida barcha kerakli ma'lumotlar",
        "contact_title": "Yordam kerakmi?", "contact_text": "Agar savolingizga javob topmagan bo'lsangiz, biz bilan bog'laning.",
        "contact_btn": "Bog'lanish"
      },
      "sidebar": {
        "main": "Asosiy", "points": "Ballar", "settings": "Sozlamalar", "exam": "Imtihon"
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources, lng: 'uz', fallbackLng: 'uz', interpolation: { escapeValue: false }
});

export default i18n;
