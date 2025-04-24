import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@shared/LangContext';
import translations from '@shared/i18n';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function Header() {
  const { uiLang, setUiLang } = useLang();
  const labels = translations[uiLang];
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-amber-50 shadow-xs shadow-amber-900/5 z-20">
      <nav className="flex items-center justify-center gap-6 font-medium h-full px-4">
        <Link to="/firegate" className="hover:text-amber-600 transition">
          Firegate
        </Link>
        <Link to="/aeolus" className="hover:text-amber-600 transition">
          AEOLUS
        </Link>
        <Select value={uiLang} onValueChange={(value) => setUiLang(value)}>
          <SelectTrigger className="w-32 ml-4">
            <SelectValue placeholder={labels.language} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">🌐 English</SelectItem>
            <SelectItem value="es">🇪🇸 Español</SelectItem>
            <SelectItem value="ro">🇷🇴 Romana</SelectItem>
          </SelectContent>
        </Select>
      </nav>
    </header>
  );
}
