/**
 * Internationalization module for the War Data Visualization PWA
 */

// Default language
let currentLanguage = "en"

// Translations
const translations = {
  en: {
    // Header
    loading: "Loading data...",
    loading_memorial: "Loading memorial data...",
    loading_infrastructure: "Loading infrastructure data...",
    loading_statistics: "Loading statistics data...",

    // Main tabs
    home_tab: "Home",
    statistics_tab: "Statistics",
    memorial_tab: "Memorial",
    infrastructure_tab: "Infrastructure",
    contact_tab: "Contact",

    // Statistics page
    total_casualties: "Total Casualties",
    children: "Children",
    women: "Women",
    medical_personnel: "Medical Personnel",
    press: "Press",
    injured: "Injured",
    select_region: "Please select a region",
    select_date: "Select Date",

    // Region selector
    gaza_region: "Gaza",
    westbank_region: "West Bank",

    // Memorial page
    memorial_title: "In Memory",
    memorial_description: "Honoring those who have lost their lives in this conflict. May they rest in peace.",
    search_names: "Search names...",
    age: "Age",
    location: "Location",
    all_casualties: "All Casualties",
    journalists: "Journalists",
    children_filter: "Children",
    women_filter: "Women",
    medical_filter: "Medical Personnel",
    no_results: "No results found",
    showing_results: "Showing {start}-{end} of {total} results",

    // Infrastructure page
    infrastructure_title: "Infrastructure Damage",
    infrastructure_description: "Data on infrastructure damaged during the conflict.",
    civic_buildings: "Civic Buildings",
    schools: "Schools",
    mosques: "Mosques",
    churches: "Churches",
    residential: "Residential Buildings",
    destroyed: "Destroyed",
    damaged: "Damaged",

    // Contact page
    contact_title: "Contact Us",
    contact_description: "Have questions or feedback? Get in touch with us.",
    name_label: "Name",
    email_label: "Email",
    message_label: "Message",
    submit_button: "Send Message",
    name_placeholder: "Your name",
    email_placeholder: "Your email",
    message_placeholder: "Your message",
    contact_success: "Thank you! Your message has been sent.",
    contact_error: "Error sending message. Please try again.",

    // Footer
    data_source: "Data source: Tech For Palestine",
    last_updated: "Last updated:",
    data_fetched: "Data fetched:",

    // Offline message
    offline_message: "You are currently offline. Some data may not be up to date.",
  },
  ar: {
    // Header
    loading: "جاري تحميل البيانات...",
    loading_memorial: "جاري تحميل بيانات الضحايا...",
    loading_infrastructure: "جاري تحميل بيانات البنية التحتية...",
    loading_statistics: "جاري تحميل بيانات الإحصائيات...",

    // Main tabs
    home_tab: "الرئيسية",
    statistics_tab: "الإحصائيات",
    memorial_tab: "الضحايا",
    infrastructure_tab: "البنية التحتية",
    contact_tab: "اتصل بنا",

    // Statistics page
    total_casualties: "إجمالي الضحايا",
    children: "الأطفال",
    women: "النساء",
    medical_personnel: "الطاقم الطبي",
    press: "الصحافة",
    injured: "الجرحى",
    select_region: "الرجاء اختيار منطقة",
    select_date: "اختر التاريخ",

    // Region selector
    gaza_region: "غزة",
    westbank_region: "الضفة الغربية",

    // Memorial page
    memorial_title: "في ذكراهم",
    memorial_description: "تكريماً لمن فقدوا حياتهم في هذا الصراع. فليرقدوا في سلام.",
    search_names: "البحث عن أسماء...",
    age: "العمر",
    location: "الموقع",
    all_casualties: "جميع الضحايا",
    journalists: "الصحفيون",
    children_filter: "الأطفال",
    women_filter: "النساء",
    medical_filter: "الطاقم الطبي",
    no_results: "لم يتم العثور على نتائج",
    showing_results: "عرض {start}-{end} من {total} نتيجة",

    // Infrastructure page
    infrastructure_title: "الأضرار في البنية التحتية",
    infrastructure_description: "بيانات عن البنية التحتية المتضررة خلال الصراع.",
    civic_buildings: "المباني المدنية",
    schools: "المدارس",
    mosques: "المساجد",
    churches: "الكنائس",
    residential: "المباني السكنية",
    destroyed: "مدمرة",
    damaged: "متضررة",

    // Contact page
    contact_title: "اتصل بنا",
    contact_description: "هل لديك أسئلة أو ملاحظات؟ تواصل معنا.",
    name_label: "الاسم",
    email_label: "البريد الإلكتروني",
    message_label: "الرسالة",
    submit_button: "إرسال الرسالة",
    name_placeholder: "اسمك",
    email_placeholder: "بريدك الإلكتروني",
    message_placeholder: "رسالتك",
    contact_success: "شكرا لك! تم إرسال رسالتك.",
    contact_error: "خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.",

    // Footer
    data_source: "مصدر البيانات: تقنية لفلسطين",
    last_updated: "آخر تحديث:",
    data_fetched: "تم جلب البيانات:",

    // Offline message
    offline_message: "أنت غير متصل بالإنترنت حالياً. قد لا تكون بعض البيانات محدثة.",
  },
}

/**
 * Set the current language and update the UI
 * @param {string} lang - Language code ('en', 'ar', etc.)
 */
function setLanguage(lang) {
  if (!translations[lang]) {
    console.error(`Language ${lang} is not supported.`)
    return
  }

  currentLanguage = lang
  document.documentElement.lang = lang

  // Set RTL for Arabic
  if (lang === "ar") {
    document.documentElement.dir = "rtl"
    document.body.classList.add("rtl")
    document.body.classList.remove("ltr")
  } else {
    document.documentElement.dir = "ltr"
    document.body.classList.add("ltr")
    document.body.classList.remove("rtl")
  }

  updateTranslations()

  localStorage.setItem("preferred-language", lang)

  // Dispatch language change event
  document.dispatchEvent(
    new CustomEvent("languageChanged", {
      detail: { language: currentLanguage },
    }),
  )
}

/**
 * Update all translatable elements in the document
 */
function updateTranslations() {
  const elements = document.querySelectorAll("[data-i18n]")
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n")
    if (translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key]
    } else {
      console.warn(`Missing translation for key: ${key}`)
    }
  })

  const placeholders = document.querySelectorAll("[data-i18n-placeholder]")
  placeholders.forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder")
    if (translations[currentLanguage][key]) {
      element.placeholder = translations[currentLanguage][key]
    } else {
      console.warn(`Missing translation for placeholder: ${key}`)
    }
  })

  const titles = document.querySelectorAll("[data-i18n-title]")
  titles.forEach((element) => {
    const key = element.getAttribute("data-i18n-title")
    if (translations[currentLanguage][key]) {
      element.title = translations[currentLanguage][key]
    } else {
      console.warn(`Missing translation for title: ${key}`)
    }
  })
}

/**
 * Get translation for a specific key
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
function getTranslation(key) {
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key]
  }
  console.warn(`Missing translation for key: ${key}`)
  return key
}

/**
 * Initialize the internationalization module
 */
function initI18n() {
  const savedLanguage = localStorage.getItem("preferred-language")
  if (savedLanguage && translations[savedLanguage]) {
    setLanguage(savedLanguage)
  } else {
    const browserLang = navigator.language.split("-")[0]
    if (translations[browserLang]) {
      setLanguage(browserLang)
    } else {
      setLanguage("en")
    }
  }

  const languageSelector = document.getElementById("language-selector")
  if (languageSelector) {
    languageSelector.value = currentLanguage
    languageSelector.addEventListener("change", (e) => {
      setLanguage(e.target.value)
    })
  }
}

// Export the i18n module functions
window.I18nModule = {
  setLanguage,
  getTranslation,
  initI18n,
  currentLanguage,
}
