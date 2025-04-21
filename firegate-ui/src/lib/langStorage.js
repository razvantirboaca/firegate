export const getSavedLang = () => localStorage.getItem('firegateLang') || 'en';
export const saveLang = (lang) => localStorage.setItem('firegateLang', lang);