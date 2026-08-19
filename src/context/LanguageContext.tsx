import { createContext, useContext, useState, type ReactNode } from 'react'
import { es } from '../i18n/es'
import { en } from '../i18n/en'

export type Lang = 'es' | 'en'

const DICTS: Record<Lang, typeof es> = { es, en }
const LOCALES: Record<Lang, string> = { es: 'es-ES', en: 'en-US' }
const LANG_KEY = 'aftergolf.lang'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** The active dictionary — read as e.g. dict.sidebar.shop, fully typed. */
  dict: typeof es
  /** BCP 47 locale for the active language, for Intl/toLocaleString calls. */
  locale: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function loadLang(): Lang {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'es'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  function setLang(next: Lang) {
    setLangState(next)
    localStorage.setItem(LANG_KEY, next)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, dict: DICTS[lang], locale: LOCALES[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}

/** Fills {{placeholders}} in a dictionary string, e.g. interpolate(dict.history.greeting, { firstName }). */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ''))
}
