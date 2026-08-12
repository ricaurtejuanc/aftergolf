import logoUrl from '../assets/logo.webp'

interface Props {
  className?: string
}

export function Logo({ className }: Props) {
  return <img src={logoUrl} alt="AfterGolf" className={className} draggable={false} />
}
