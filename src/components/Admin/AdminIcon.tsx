import type { ReactNode } from "react"

export type IconName =
  | "book"
  | "grid"
  | "search"
  | "bell"
  | "chevron"
  | "plus"
  | "list"
  | "edit"
  | "trash"
  | "arrow"
  | "logout"
  | "menu"
  | "close"
  | "music"

export default function AdminIcon({
  name,
  className = "",
}: {
  name: IconName
  className?: string
}) {
  const paths: Record<IconName, ReactNode> = {
    book: (
      <>
        <path d="M4 5.3c2.7-.8 5.3-.3 8 1.5v12c-2.7-1.8-5.3-2.3-8-1.5v-12Z" />
        <path d="M20 5.3c-2.7-.8-5.3-.3-8 1.5v12c2.7-1.8 5.3-2.3 8-1.5v-12Z" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    search: (
      <path d="m20 20-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
    ),
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Zm-8 11h4" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    plus: <path d="M12 5v14M5 12h14" />,
    list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
    edit: <path d="m14 5 5 5M4 20l3.5-.7L19 7.8 16.2 5 4.7 16.5 4 20Z" />,
    trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    logout: <path d="M10 5H4v14h6m5-4 4-4-4-4m4 4H9" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    music: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
