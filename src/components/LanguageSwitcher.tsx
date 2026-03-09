/**
 * LanguageSwitcher Component
 * 
 * Provides a simple language switcher UI to toggle between
 * Chinese (zh) and English (en) locales.
 */

import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Locale } from '../i18n';

export function LanguageSwitcher() {
  const locale = useEditorStore((state) => state.locale);
  const setLocale = useEditorStore((state) => state.setLocale);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value as Locale;
    setLocale(newLocale);
  };

  return (
    <div className="language-switcher">
      <select
        id="language-switcher"
        name="language"
        value={locale}
        onChange={handleChange}
        className="language-select"
        title="Switch language / 切换语言"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;
