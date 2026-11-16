export type Language = "es" | "en" | "pl" | "ru"

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "ru", label: "Русский" },
]

export const DEFAULT_LANGUAGE: Language = "es"

/**
 * Diccionario de traducción. Cada clave es un identificador estable (no el texto en
 * español) para que renombrar el texto visible no rompa las demás traducciones.
 *
 * Alcance actual: shell de la app (sidebar + header). El resto de las páginas
 * (Contactos, Campañas, Configuración, etc.) sigue en español por ahora y se va a ir
 * traduciendo en pasadas siguientes — son demasiadas páginas para cubrir de una vez.
 */
export const translations: Record<Language, Record<string, string>> = {
  es: {
    "nav.conversations": "Conversaciones",
    "nav.contacts": "Contactos",
    "nav.campaigns": "Campañas",
    "nav.appointments": "Citas",
    "nav.agents": "Agentes",
    "nav.leads": "Leads",
    "nav.docsApi": "Documentación API",
    "nav.settings": "Configuración",
    "nav.logout": "Cerrar sesión",
    "nav.backToMySpace": "Volver a mi espacio",
    "nav.loading": "Cargando…",
    "theme.light": "Claro",
    "theme.dark": "Oscuro",
    "theme.system": "Sistema",
    "language.label": "Idioma",
    "header.filters": "Filtros",
    "header.export": "Exportar",
    "header.settings": "Configuración",
  },
  en: {
    "nav.conversations": "Conversations",
    "nav.contacts": "Contacts",
    "nav.campaigns": "Campaigns",
    "nav.appointments": "Appointments",
    "nav.agents": "Agents",
    "nav.leads": "Leads",
    "nav.docsApi": "API Docs",
    "nav.settings": "Settings",
    "nav.logout": "Log out",
    "nav.backToMySpace": "Back to my space",
    "nav.loading": "Loading…",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "language.label": "Language",
    "header.filters": "Filters",
    "header.export": "Export",
    "header.settings": "Settings",
  },
  pl: {
    "nav.conversations": "Konwersacje",
    "nav.contacts": "Kontakty",
    "nav.campaigns": "Kampanie",
    "nav.appointments": "Wizyty",
    "nav.agents": "Agenci",
    "nav.leads": "Leady",
    "nav.docsApi": "Dokumentacja API",
    "nav.settings": "Ustawienia",
    "nav.logout": "Wyloguj się",
    "nav.backToMySpace": "Wróć do mojej przestrzeni",
    "nav.loading": "Ładowanie…",
    "theme.light": "Jasny",
    "theme.dark": "Ciemny",
    "theme.system": "Systemowy",
    "language.label": "Język",
    "header.filters": "Filtry",
    "header.export": "Eksportuj",
    "header.settings": "Ustawienia",
  },
  ru: {
    "nav.conversations": "Беседы",
    "nav.contacts": "Контакты",
    "nav.campaigns": "Кампании",
    "nav.appointments": "Встречи",
    "nav.agents": "Агенты",
    "nav.leads": "Лиды",
    "nav.docsApi": "Документация API",
    "nav.settings": "Настройки",
    "nav.logout": "Выйти",
    "nav.backToMySpace": "Вернуться в моё пространство",
    "nav.loading": "Загрузка…",
    "theme.light": "Светлая",
    "theme.dark": "Тёмная",
    "theme.system": "Системная",
    "language.label": "Язык",
    "header.filters": "Фильтры",
    "header.export": "Экспорт",
    "header.settings": "Настройки",
  },
}
