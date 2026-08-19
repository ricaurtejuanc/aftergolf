import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-fairway-900">{title}</h2>
      <div className="space-y-2 text-sm text-fairway-700">{children}</div>
    </section>
  )
}

export function PrivacyPage() {
  const { dict } = useLanguage()
  const t = dict.privacy
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">{t.pageTitle}</h1>
        <p className="mt-1 text-sm text-fairway-600">{t.pageSubtitle}</p>
      </div>

      <Section title={t.section1Title}>
        <p>{t.section1Body}</p>
      </Section>

      <Section title={t.section2Title}>
        <p>{t.section2Intro}</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t.section2Item1}</li>
          <li>{t.section2Item2}</li>
          <li>{t.section2Item3}</li>
          <li>
            {t.section2Item4Prefix}
            <Link to="/terminos" className="underline-offset-2 hover:underline">
              {t.section2Item4LinkText}
            </Link>
            {t.section2Item4Suffix}
          </li>
          <li>{t.section2Item5}</li>
        </ul>
      </Section>

      <Section title={t.section3Title}>
        <p>{t.section3Body}</p>
      </Section>

      <Section title={t.section4Title}>
        <p>{t.section4Body}</p>
      </Section>

      <Section title={t.section5Title}>
        <p>{t.section5Body}</p>
      </Section>

      <Section title={t.section6Title}>
        <p>{t.section6Body}</p>
      </Section>

      <Section title={t.section7Title}>
        <p>{t.section7Body}</p>
      </Section>

      <Section title={t.section8Title}>
        <p>{t.section8Body}</p>
      </Section>

      <Section title={t.section9Title}>
        <p>{t.section9Body}</p>
      </Section>

      <Section title={t.section10Title}>
        <p>{t.section10Body}</p>
      </Section>
    </div>
  )
}
