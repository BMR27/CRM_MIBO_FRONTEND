export interface GuideStep {
  title: string
  description: string
}

export interface GuideModule {
  id: string
  title: string
  tagline: string
  steps: GuideStep[]
}

export type GuideContent = Record<string, GuideModule[]>

export const guideContent: GuideContent = {
  es: [
    {
      id: "conversaciones",
      title: "Conversaciones",
      tagline: "Tu bandeja unificada de WhatsApp (y otros canales).",
      steps: [
        {
          title: "Bandeja unificada",
          description:
            "Todas las conversaciones de tus clientes aparecen en la lista de la izquierda, ordenadas por el mensaje más reciente. Usa el buscador para encontrar una por nombre o número.",
        },
        {
          title: "Responder un chat",
          description:
            "Selecciona una conversación para abrirla. Escribe tu mensaje abajo, agrega emojis o archivos adjuntos (imágenes, documentos) con los íconos junto al campo de texto, y presiona enviar.",
        },
        {
          title: "Macros de respuesta rápida",
          description:
            "Si ya tienes mensajes predefinidos para preguntas frecuentes, usa el botón \"Macros\" junto al campo de texto para insertarlos sin volver a escribirlos.",
        },
        {
          title: "Asignar, estado y prioridad",
          description:
            "En el panel de Detalles (a la derecha del chat) puedes cambiar el estado (Activa/Resuelta), la prioridad y asignar la conversación a otro agente con el botón \"Asignar\".",
        },
        {
          title: "Comentarios internos",
          description:
            "Desde el mismo panel de Detalles puedes dejar notas internas sobre la conversación, visibles solo para tu equipo, nunca para el cliente.",
        },
      ],
    },
    {
      id: "contactos",
      title: "Contactos",
      tagline: "Tu libreta de clientes, sincronizada con cada conversación.",
      steps: [
        {
          title: "Ver y buscar contactos",
          description:
            "La lista muestra todos los contactos registrados con su nombre y teléfono. Usa el buscador para filtrar por nombre o número.",
        },
        {
          title: "Crear o editar un contacto",
          description:
            "Usa el botón para agregar un contacto manualmente, o edita uno existente si necesitas corregir su nombre o teléfono.",
        },
        {
          title: "Importar contactos desde Excel",
          description:
            "Si ya tienes una base de clientes, impórtala de una vez subiendo un archivo Excel/CSV con las columnas de nombre y teléfono, en vez de capturarlos uno por uno.",
        },
        {
          title: "Abrir el chat de un contacto",
          description:
            "Desde la lista de contactos puedes abrir directamente la conversación de WhatsApp con esa persona, sin tener que buscarla en Conversaciones.",
        },
      ],
    },
    {
      id: "envios",
      title: "Campañas",
      tagline: "Envíos masivos de plantillas de WhatsApp aprobadas, con seguimiento por campaña.",
      steps: [
        {
          title: "Qué es una campaña",
          description:
            "Es un envío masivo de un mismo mensaje (una plantilla previamente aprobada por WhatsApp) a muchos contactos a la vez — por ejemplo, un aviso de promoción o un recordatorio.",
        },
        {
          title: "Crear una campaña nueva",
          description:
            "Pulsa \"Nueva campaña\", ponle un nombre y elige la plantilla de WhatsApp que quieres enviar entre las disponibles para tu espacio de trabajo.",
        },
        {
          title: "Elegir destinatarios",
          description:
            "Selecciona contactos ya guardados marcando los checkboxes, o sube un Excel con la lista de destinatarios si son muchos o no están registrados todavía.",
        },
        {
          title: "Completar los datos de la plantilla",
          description:
            "Si la plantilla necesita datos variables (por ejemplo, una fecha o un número de pedido), captúralos en el formulario o inclúyelos como columna en tu Excel.",
        },
        {
          title: "Enviar y dar seguimiento",
          description:
            "Al enviar, la campaña queda registrada en la tabla con destinatarios, enviados, fallidos y estado. Usa \"Ver\" para revisar el detalle de cada mensaje enviado.",
        },
      ],
    },
    {
      id: "citas",
      title: "Citas",
      tagline: "Agenda centralizada de llamadas y videollamadas con tus clientes.",
      steps: [
        {
          title: "Vista de calendario",
          description:
            "Consulta tus sesiones agendadas por día, semana o mes, con un resumen de cuántas tienes hoy, próximas y completadas.",
        },
        {
          title: "Agendar una nueva sesión",
          description:
            "Pulsa \"Nueva\", indica el cliente, teléfono, tipo (llamada o videollamada), fecha y hora. Puedes agregar notas sobre el propósito de la cita.",
        },
        {
          title: "Invitar al cliente",
          description:
            "Usa el botón \"Invitar\" para mandarle al cliente, directo por WhatsApp, el enlace de la reunión agendada.",
        },
        {
          title: "Dar seguimiento",
          description:
            "Marca una sesión como completada o cancelada según corresponda, para mantener tu agenda y tus métricas al día.",
        },
      ],
    },
    {
      id: "agentes",
      title: "Agentes",
      tagline: "Gestiona a tu equipo y revisa su desempeño.",
      steps: [
        {
          title: "Ver tu equipo",
          description:
            "La lista muestra a todos los agentes del espacio de trabajo, con su estado en tiempo real: disponible, ocupado o desconectado.",
        },
        {
          title: "Agregar un agente nuevo",
          description:
            "Pulsa el botón para crear una cuenta nueva: nombre, correo, contraseña temporal y rol (agente, supervisor o administrador).",
        },
        {
          title: "Desempeño por agente",
          description:
            "Revisa cuántas conversaciones ha atendido y resuelto cada agente, útil para repartir carga de trabajo o evaluar al equipo.",
        },
      ],
    },
    {
      id: "leads",
      title: "Leads",
      tagline: "Prospectos capturados antes de convertirse en contactos del CRM.",
      steps: [
        {
          title: "Qué es un lead",
          description:
            "Un lead es un prospecto que llegó desde un formulario de tu sitio web o una integración externa — todavía no es un contacto con el que puedas chatear directamente.",
        },
        {
          title: "Revisar leads nuevos",
          description:
            "La lista muestra los leads recién capturados con su nombre, correo, teléfono y la empresa que indicó, si aplica.",
        },
        {
          title: "Convertir un lead en contacto",
          description:
            "Cuando un lead esté calificado, conviértelo en contacto con un clic para poder iniciar una conversación de WhatsApp con él.",
        },
        {
          title: "API Keys para capturar leads",
          description:
            "Genera una clave de API desde esta sección para conectar el formulario de tu sitio web (o cualquier sistema externo) y que los leads lleguen aquí automáticamente.",
        },
      ],
    },
    {
      id: "documentacion-api",
      title: "Documentación API",
      tagline: "Para integrar sistemas externos con tu CRM.",
      steps: [
        {
          title: "Para qué sirve",
          description:
            "Aquí encuentras todos los endpoints disponibles para que un desarrollador conecte tu sitio web, tienda en línea u otro sistema con este CRM.",
        },
        {
          title: "Autenticación",
          description:
            "Casi todos los endpoints requieren iniciar sesión primero para obtener un token (access_token), que luego se envía en cada petición.",
        },
        {
          title: "Explorar por categoría",
          description:
            "Los endpoints están agrupados por tema — Contactos, Órdenes, Mensajes, Leads, Webhooks — cada uno con un ejemplo de código listo para copiar y pegar.",
        },
        {
          title: "Webhooks salientes",
          description:
            "Registra tu propia URL para recibir en tiempo real los mensajes que te respondan por WhatsApp y los cambios de estado de los que envíes, sin tener que preguntar constantemente a la API.",
        },
      ],
    },
    {
      id: "configuracion",
      title: "Configuración",
      tagline: "Personaliza tu espacio de trabajo.",
      steps: [
        {
          title: "General",
          description:
            "Cambia el nombre de tu empresa, sube tu logo y define el color de marca que se usa en el menú lateral y el encabezado.",
        },
        {
          title: "Apariencia e idioma",
          description:
            "Elige tema claro, oscuro o automático (según tu sistema), y el idioma de toda la interfaz — español, inglés, polaco o ruso.",
        },
        {
          title: "Notificaciones",
          description:
            "Controla si quieres recibir avisos de nuevos mensajes, asignaciones de conversación y menciones en notas internas.",
        },
        {
          title: "Integraciones y seguridad",
          description:
            "Las pestañas de Integraciones (WhatsApp, Facebook, Voz) y Seguridad están reservadas para el super-administrador de la plataforma.",
        },
      ],
    },
    {
      id: "estadisticas",
      title: "Estadísticas",
      tagline: "El pulso de tu operación, de un vistazo.",
      steps: [
        {
          title: "Resumen general",
          description:
            "Consulta de un vistazo cuántas conversaciones están abiertas, cuántas se han resuelto y cuántos agentes están conectados en este momento.",
        },
        {
          title: "Métricas de mensajería",
          description:
            "Revisa cuántos mensajes se han enviado, cuántos fueron leídos y cuántas respuestas has recibido de tus clientes.",
        },
        {
          title: "Accesos rápidos",
          description:
            "Desde aquí puedes saltar directo al desempeño por agente para profundizar en cómo está trabajando tu equipo.",
        },
      ],
    },
    {
      id: "usuarios-plataforma",
      title: "Usuarios (plataforma)",
      tagline: "Vista global de todos los usuarios, solo para el super-admin.",
      steps: [
        {
          title: "Qué muestra este módulo",
          description:
            "Lista a todos los usuarios de todos los espacios de trabajo en una sola tabla. Es distinto a Agentes, que solo muestra el equipo del espacio en el que estás parado.",
        },
        {
          title: "Buscar y filtrar",
          description:
            "El buscador acepta nombre, correo, ID de usuario o nombre del espacio. Además puedes filtrar por espacio, por rol y por estado de sesión: con sesión activa, sin sesión, nunca ingresaron o solo super-admins.",
        },
        {
          title: "Revisar el último ingreso",
          description:
            "La columna \"Último ingreso\" muestra hace cuánto entró cada persona y la fecha exacta. Se registra en cada inicio de sesión; quien nunca haya entrado desde que se activó el registro aparece marcado en ámbar.",
        },
        {
          title: "Ver el detalle de una persona",
          description:
            "\"Ver detalle\" abre toda su ficha: rol y sus permisos, espacio con plan, estado y módulos habilitados, IP del último ingreso, si tiene sesión abierta ahora mismo, conversaciones asignadas y mensajes enviados.",
        },
        {
          title: "Exportar a CSV",
          description:
            "El botón \"Exportar CSV\" descarga exactamente lo que estás viendo con los filtros aplicados, listo para una auditoría o un reporte.",
        },
      ],
    },
  ],
  en: [
    {
      id: "conversaciones",
      title: "Conversations",
      tagline: "Your unified WhatsApp inbox (and other channels).",
      steps: [
        {
          title: "Unified inbox",
          description:
            "All your customers' conversations appear in the list on the left, sorted by the most recent message. Use the search box to find one by name or number.",
        },
        {
          title: "Reply to a chat",
          description:
            "Select a conversation to open it. Type your message below, add emojis or attachments (images, documents) with the icons next to the text field, and press send.",
        },
        {
          title: "Quick reply macros",
          description:
            "If you already have predefined messages for frequent questions, use the \"Macros\" button next to the text field to insert them without retyping.",
        },
        {
          title: "Assign, status and priority",
          description:
            "In the Details panel (to the right of the chat) you can change the status (Active/Resolved), the priority, and assign the conversation to another agent with the \"Assign\" button.",
        },
        {
          title: "Internal comments",
          description:
            "From the same Details panel you can leave internal notes about the conversation, visible only to your team, never to the customer.",
        },
      ],
    },
    {
      id: "contactos",
      title: "Contacts",
      tagline: "Your customer directory, synced with every conversation.",
      steps: [
        {
          title: "View and search contacts",
          description:
            "The list shows every registered contact with their name and phone number. Use the search box to filter by name or number.",
        },
        {
          title: "Create or edit a contact",
          description:
            "Use the button to add a contact manually, or edit an existing one if you need to fix their name or phone number.",
        },
        {
          title: "Import contacts from Excel",
          description:
            "If you already have a customer base, import it all at once by uploading an Excel/CSV file with name and phone columns, instead of entering them one by one.",
        },
        {
          title: "Open a contact's chat",
          description:
            "From the contacts list you can open that person's WhatsApp conversation directly, without having to search for it in Conversations.",
        },
      ],
    },
    {
      id: "envios",
      title: "Campaigns",
      tagline: "Bulk sends of approved WhatsApp templates, tracked per campaign.",
      steps: [
        {
          title: "What is a campaign",
          description:
            "It's a bulk send of the same message (a WhatsApp-approved template) to many contacts at once — for example, a promotion notice or a reminder.",
        },
        {
          title: "Create a new campaign",
          description:
            "Click \"New campaign\", give it a name, and choose the WhatsApp template you want to send among those available for your workspace.",
        },
        {
          title: "Choose recipients",
          description:
            "Select already-saved contacts by checking the boxes, or upload an Excel file with the recipient list if there are many or they're not registered yet.",
        },
        {
          title: "Fill in the template's fields",
          description:
            "If the template needs variable data (for example, a date or an order number), enter it in the form or include it as a column in your Excel file.",
        },
        {
          title: "Send and track",
          description:
            "After sending, the campaign is logged in the table with recipients, sent, failed and status. Use \"View\" to check the detail of each message sent.",
        },
      ],
    },
    {
      id: "citas",
      title: "Appointments",
      tagline: "A centralized schedule for calls and video calls with your customers.",
      steps: [
        {
          title: "Calendar view",
          description:
            "Check your scheduled sessions by day, week or month, with a summary of how many you have today, upcoming and completed.",
        },
        {
          title: "Schedule a new session",
          description:
            "Click \"New\", enter the client, phone, type (call or video call), date and time. You can add notes about the purpose of the appointment.",
        },
        {
          title: "Invite the client",
          description:
            "Use the \"Invite\" button to send the client the scheduled meeting link directly via WhatsApp.",
        },
        {
          title: "Follow up",
          description:
            "Mark a session as completed or cancelled as appropriate, to keep your schedule and metrics up to date.",
        },
      ],
    },
    {
      id: "agentes",
      title: "Agents",
      tagline: "Manage your team and review their performance.",
      steps: [
        {
          title: "See your team",
          description:
            "The list shows every agent in the workspace, with their real-time status: available, busy, or offline.",
        },
        {
          title: "Add a new agent",
          description:
            "Click the button to create a new account: name, email, temporary password, and role (agent, supervisor, or admin).",
        },
        {
          title: "Performance per agent",
          description:
            "Check how many conversations each agent has handled and resolved — useful for balancing workload or evaluating the team.",
        },
      ],
    },
    {
      id: "leads",
      title: "Leads",
      tagline: "Prospects captured before they become CRM contacts.",
      steps: [
        {
          title: "What is a lead",
          description:
            "A lead is a prospect that came in from a form on your website or an external integration — it's not yet a contact you can chat with directly.",
        },
        {
          title: "Review new leads",
          description:
            "The list shows newly captured leads with their name, email, phone, and the company they listed, if any.",
        },
        {
          title: "Convert a lead into a contact",
          description:
            "Once a lead is qualified, convert it into a contact with one click so you can start a WhatsApp conversation with them.",
        },
        {
          title: "API keys to capture leads",
          description:
            "Generate an API key from this section to connect your website's form (or any external system) so leads arrive here automatically.",
        },
      ],
    },
    {
      id: "documentacion-api",
      title: "API Documentation",
      tagline: "To integrate external systems with your CRM.",
      steps: [
        {
          title: "What it's for",
          description:
            "Here you'll find every available endpoint for a developer to connect your website, online store, or other system with this CRM.",
        },
        {
          title: "Authentication",
          description:
            "Almost every endpoint requires signing in first to get a token (access_token), which is then sent with each request.",
        },
        {
          title: "Browse by category",
          description:
            "Endpoints are grouped by topic — Contacts, Orders, Messages, Leads, Webhooks — each with a ready-to-copy code example.",
        },
        {
          title: "Outgoing webhooks",
          description:
            "Register your own URL to receive, in real time, WhatsApp replies and status changes for messages you send, without having to constantly poll the API.",
        },
      ],
    },
    {
      id: "configuracion",
      title: "Settings",
      tagline: "Customize your workspace.",
      steps: [
        {
          title: "General",
          description:
            "Change your company name, upload your logo, and set the accent color used in the sidebar and header.",
        },
        {
          title: "Appearance and language",
          description:
            "Choose light, dark, or automatic (system) theme, and the language for the whole interface — Spanish, English, Polish, or Russian.",
        },
        {
          title: "Notifications",
          description:
            "Control whether you want to receive alerts for new messages, conversation assignments, and mentions in internal notes.",
        },
        {
          title: "Integrations and security",
          description:
            "The Integrations (WhatsApp, Facebook, Voice) and Security tabs are reserved for the platform super-admin.",
        },
      ],
    },
    {
      id: "estadisticas",
      title: "Statistics",
      tagline: "The pulse of your operation, at a glance.",
      steps: [
        {
          title: "Overview",
          description:
            "See at a glance how many conversations are open, how many have been resolved, and how many agents are currently connected.",
        },
        {
          title: "Messaging metrics",
          description:
            "Check how many messages have been sent, how many were read, and how many replies you've received from your customers.",
        },
        {
          title: "Quick access",
          description:
            "From here you can jump straight to agent performance to dig deeper into how your team is doing.",
        },
      ],
    },
    {
      id: "usuarios-plataforma",
      title: "Users (platform)",
      tagline: "A global view of every user, for the super-admin only.",
      steps: [
        {
          title: "What this module shows",
          description:
            "Every user from every workspace in a single table. It is different from Agents, which only shows the team of the workspace you are currently in.",
        },
        {
          title: "Search and filter",
          description:
            "The search box accepts a name, an email, a user ID or a workspace name. You can also filter by workspace, by role and by session state: active session, no session, never signed in, or super-admins only.",
        },
        {
          title: "Check the last login",
          description:
            "The \"Last login\" column shows how long ago each person signed in and the exact date. It is recorded on every sign-in; anyone who has not signed in since tracking was enabled is flagged in amber.",
        },
        {
          title: "Open a person's detail",
          description:
            "\"View detail\" opens the full record: role and its permissions, workspace with plan, status and enabled modules, last login IP, whether they have a session open right now, assigned conversations and messages sent.",
        },
        {
          title: "Export to CSV",
          description:
            "The \"Export CSV\" button downloads exactly what you are seeing with the current filters applied, ready for an audit or a report.",
        },
      ],
    },
  ],
  pl: [
    {
      id: "conversaciones",
      title: "Konwersacje",
      tagline: "Twoja ujednolicona skrzynka WhatsApp (i innych kanałów).",
      steps: [
        {
          title: "Ujednolicona skrzynka",
          description:
            "Wszystkie rozmowy Twoich klientów pojawiają się na liście po lewej, posortowane według najnowszej wiadomości. Użyj wyszukiwarki, aby znaleźć rozmowę po imieniu lub numerze.",
        },
        {
          title: "Odpowiadanie na czacie",
          description:
            "Wybierz rozmowę, aby ją otworzyć. Wpisz wiadomość poniżej, dodaj emoji lub załączniki (zdjęcia, dokumenty) ikonami obok pola tekstowego i wyślij.",
        },
        {
          title: "Makra szybkiej odpowiedzi",
          description:
            "Jeśli masz już gotowe wiadomości na częste pytania, użyj przycisku \"Makra\" obok pola tekstowego, aby je wstawić bez ponownego pisania.",
        },
        {
          title: "Przypisanie, status i priorytet",
          description:
            "W panelu Szczegółów (po prawej stronie czatu) możesz zmienić status (Aktywna/Zakończona), priorytet oraz przypisać rozmowę innemu agentowi przyciskiem \"Przypisz\".",
        },
        {
          title: "Notatki wewnętrzne",
          description:
            "W tym samym panelu Szczegółów możesz zostawić wewnętrzne notatki dotyczące rozmowy, widoczne tylko dla Twojego zespołu, nigdy dla klienta.",
        },
      ],
    },
    {
      id: "contactos",
      title: "Kontakty",
      tagline: "Twoja baza klientów, zsynchronizowana z każdą rozmową.",
      steps: [
        {
          title: "Przeglądanie i wyszukiwanie kontaktów",
          description:
            "Lista pokazuje wszystkie zarejestrowane kontakty wraz z imieniem i numerem telefonu. Użyj wyszukiwarki, aby filtrować po imieniu lub numerze.",
        },
        {
          title: "Tworzenie lub edycja kontaktu",
          description:
            "Użyj przycisku, aby dodać kontakt ręcznie, lub edytuj istniejący, jeśli musisz poprawić jego imię lub numer telefonu.",
        },
        {
          title: "Import kontaktów z Excela",
          description:
            "Jeśli masz już bazę klientów, zaimportuj ją od razu, wgrywając plik Excel/CSV z kolumnami imienia i telefonu, zamiast wpisywać je pojedynczo.",
        },
        {
          title: "Otwórz czat kontaktu",
          description:
            "Z listy kontaktów możesz bezpośrednio otworzyć rozmowę WhatsApp z daną osobą, bez konieczności szukania jej w Konwersacjach.",
        },
      ],
    },
    {
      id: "envios",
      title: "Kampanie",
      tagline: "Masowe wysyłki zatwierdzonych szablonów WhatsApp, śledzone per kampania.",
      steps: [
        {
          title: "Czym jest kampania",
          description:
            "To masowa wysyłka tej samej wiadomości (szablonu zatwierdzonego przez WhatsApp) do wielu kontaktów naraz — na przykład informacja o promocji lub przypomnienie.",
        },
        {
          title: "Tworzenie nowej kampanii",
          description:
            "Kliknij \"Nowa kampania\", nadaj jej nazwę i wybierz szablon WhatsApp, który chcesz wysłać spośród dostępnych dla Twojego obszaru roboczego.",
        },
        {
          title: "Wybór odbiorców",
          description:
            "Zaznacz checkboxami już zapisane kontakty lub wgraj plik Excel z listą odbiorców, jeśli jest ich dużo lub nie są jeszcze zarejestrowani.",
        },
        {
          title: "Uzupełnij pola szablonu",
          description:
            "Jeśli szablon wymaga zmiennych danych (np. daty lub numeru zamówienia), wpisz je w formularzu lub dodaj jako kolumnę w pliku Excel.",
        },
        {
          title: "Wyślij i śledź",
          description:
            "Po wysłaniu kampania zostaje zapisana w tabeli z liczbą odbiorców, wysłanych, nieudanych i statusem. Użyj \"Zobacz\", aby sprawdzić szczegóły każdej wysłanej wiadomości.",
        },
      ],
    },
    {
      id: "citas",
      title: "Wizyty",
      tagline: "Scentralizowany harmonogram połączeń i wideorozmów z klientami.",
      steps: [
        {
          title: "Widok kalendarza",
          description:
            "Sprawdzaj zaplanowane sesje według dnia, tygodnia lub miesiąca, z podsumowaniem, ile masz dzisiaj, nadchodzących i zakończonych.",
        },
        {
          title: "Zaplanuj nową sesję",
          description:
            "Kliknij \"Nowa\", podaj klienta, telefon, typ (rozmowa lub wideorozmowa), datę i godzinę. Możesz dodać notatki dotyczące celu wizyty.",
        },
        {
          title: "Zaproś klienta",
          description:
            "Użyj przycisku \"Zaproś\", aby wysłać klientowi link do zaplanowanego spotkania bezpośrednio przez WhatsApp.",
        },
        {
          title: "Śledź postępy",
          description:
            "Oznacz sesję jako zakończoną lub anulowaną, aby Twój harmonogram i statystyki były aktualne.",
        },
      ],
    },
    {
      id: "agentes",
      title: "Agenci",
      tagline: "Zarządzaj swoim zespołem i sprawdzaj jego wyniki.",
      steps: [
        {
          title: "Zobacz swój zespół",
          description:
            "Lista pokazuje wszystkich agentów w obszarze roboczym wraz z ich statusem w czasie rzeczywistym: dostępny, zajęty lub niedostępny.",
        },
        {
          title: "Dodaj nowego agenta",
          description:
            "Kliknij przycisk, aby utworzyć nowe konto: imię, e-mail, tymczasowe hasło i rolę (agent, supervisor lub administrator).",
        },
        {
          title: "Wyniki poszczególnych agentów",
          description:
            "Sprawdź, ile rozmów obsłużył i zakończył każdy agent — przydatne do rozłożenia pracy lub oceny zespołu.",
        },
      ],
    },
    {
      id: "leads",
      title: "Leady",
      tagline: "Potencjalni klienci przechwyceni, zanim staną się kontaktami w CRM.",
      steps: [
        {
          title: "Czym jest lead",
          description:
            "Lead to potencjalny klient, który przyszedł z formularza na Twojej stronie lub z zewnętrznej integracji — to jeszcze nie kontakt, z którym możesz bezpośrednio czatować.",
        },
        {
          title: "Przeglądaj nowe leady",
          description:
            "Lista pokazuje nowo przechwycone leady wraz z imieniem, e-mailem, telefonem i podaną firmą, jeśli dotyczy.",
        },
        {
          title: "Konwertuj leada na kontakt",
          description:
            "Gdy lead jest zakwalifikowany, zamień go w kontakt jednym kliknięciem, aby móc rozpocząć z nim rozmowę WhatsApp.",
        },
        {
          title: "Klucze API do przechwytywania leadów",
          description:
            "Wygeneruj klucz API z tej sekcji, aby podłączyć formularz swojej strony (lub dowolny system zewnętrzny) tak, by leady trafiały tutaj automatycznie.",
        },
      ],
    },
    {
      id: "documentacion-api",
      title: "Dokumentacja API",
      tagline: "Do integracji systemów zewnętrznych z Twoim CRM.",
      steps: [
        {
          title: "Do czego służy",
          description:
            "Tutaj znajdziesz wszystkie dostępne endpointy, dzięki którym programista połączy Twoją stronę, sklep internetowy lub inny system z tym CRM.",
        },
        {
          title: "Uwierzytelnianie",
          description:
            "Niemal wszystkie endpointy wymagają najpierw zalogowania się, aby uzyskać token (access_token), który jest następnie wysyłany z każdym żądaniem.",
        },
        {
          title: "Przeglądaj według kategorii",
          description:
            "Endpointy są pogrupowane tematycznie — Kontakty, Zamówienia, Wiadomości, Leady, Webhooki — każdy z gotowym do skopiowania przykładem kodu.",
        },
        {
          title: "Webhooki wychodzące",
          description:
            "Zarejestruj własny URL, aby odbierać w czasie rzeczywistym odpowiedzi WhatsApp i zmiany statusów wysłanych wiadomości, bez konieczności ciągłego odpytywania API.",
        },
      ],
    },
    {
      id: "configuracion",
      title: "Konfiguracja",
      tagline: "Dostosuj swój obszar roboczy.",
      steps: [
        {
          title: "Ogólne",
          description:
            "Zmień nazwę swojej firmy, wgraj logo i ustaw kolor akcentu używany w panelu bocznym i nagłówku.",
        },
        {
          title: "Wygląd i język",
          description:
            "Wybierz motyw jasny, ciemny lub automatyczny (systemowy) oraz język całego interfejsu — hiszpański, angielski, polski lub rosyjski.",
        },
        {
          title: "Powiadomienia",
          description:
            "Zdecyduj, czy chcesz otrzymywać alerty o nowych wiadomościach, przypisaniach rozmów i wzmiankach w notatkach wewnętrznych.",
        },
        {
          title: "Integracje i bezpieczeństwo",
          description:
            "Zakładki Integracje (WhatsApp, Facebook, Głos) i Bezpieczeństwo są zarezerwowane dla super-administratora platformy.",
        },
      ],
    },
    {
      id: "estadisticas",
      title: "Statystyki",
      tagline: "Puls Twojej działalności, na pierwszy rzut oka.",
      steps: [
        {
          title: "Podsumowanie",
          description:
            "Zobacz od razu, ile rozmów jest otwartych, ile zostało zakończonych i ilu agentów jest obecnie połączonych.",
        },
        {
          title: "Metryki wiadomości",
          description:
            "Sprawdź, ile wiadomości zostało wysłanych, ile zostało przeczytanych i ile odpowiedzi otrzymałeś od klientów.",
        },
        {
          title: "Szybki dostęp",
          description:
            "Stąd możesz przejść bezpośrednio do wyników agentów, aby dokładniej sprawdzić, jak pracuje Twój zespół.",
        },
      ],
    },
    {
      id: "usuarios-plataforma",
      title: "Użytkownicy (platforma)",
      tagline: "Globalny widok wszystkich użytkowników, tylko dla super-admina.",
      steps: [
        {
          title: "Co pokazuje ten moduł",
          description:
            "Wszystkich użytkowników ze wszystkich przestrzeni roboczych w jednej tabeli. To nie to samo co Agenci, gdzie widać tylko zespół przestrzeni, w której właśnie jesteś.",
        },
        {
          title: "Szukanie i filtrowanie",
          description:
            "Wyszukiwarka przyjmuje nazwę, e-mail, ID użytkownika lub nazwę przestrzeni. Możesz też filtrować po przestrzeni, roli i stanie sesji: aktywna sesja, brak sesji, nigdy nie logowali się lub tylko super-adminzy.",
        },
        {
          title: "Sprawdzanie ostatniego logowania",
          description:
            "Kolumna \"Ostatnie logowanie\" pokazuje, jak dawno dana osoba się logowała, oraz dokładną datę. Zapisuje się przy każdym logowaniu; kto nie logował się od włączenia rejestracji, jest oznaczony na bursztynowo.",
        },
        {
          title: "Szczegóły użytkownika",
          description:
            "\"Zobacz szczegóły\" otwiera pełną kartę: rolę i jej uprawnienia, przestrzeń wraz z planem, statusem i włączonymi modułami, IP ostatniego logowania, czy ma teraz otwartą sesję, przypisane rozmowy i wysłane wiadomości.",
        },
        {
          title: "Eksport do CSV",
          description:
            "Przycisk \"Eksportuj CSV\" pobiera dokładnie to, co widzisz z zastosowanymi filtrami — gotowe do audytu lub raportu.",
        },
      ],
    },
  ],
  ru: [
    {
      id: "conversaciones",
      title: "Беседы",
      tagline: "Единый инбокс WhatsApp (и других каналов).",
      steps: [
        {
          title: "Единый инбокс",
          description:
            "Все беседы с клиентами отображаются в списке слева, отсортированные по последнему сообщению. Используйте поиск, чтобы найти беседу по имени или номеру.",
        },
        {
          title: "Ответ в чате",
          description:
            "Выберите беседу, чтобы открыть её. Напишите сообщение внизу, добавьте эмодзи или вложения (изображения, документы) с помощью иконок рядом с полем ввода, и нажмите отправить.",
        },
        {
          title: "Макросы быстрых ответов",
          description:
            "Если у вас уже есть готовые сообщения для частых вопросов, используйте кнопку \"Макросы\" рядом с полем ввода, чтобы вставить их без повторного набора.",
        },
        {
          title: "Назначение, статус и приоритет",
          description:
            "На панели Детали (справа от чата) вы можете изменить статус (Активна/Завершена), приоритет и назначить беседу другому агенту кнопкой \"Назначить\".",
        },
        {
          title: "Внутренние заметки",
          description:
            "На той же панели Детали вы можете оставлять внутренние заметки о беседе, видимые только вашей команде и никогда — клиенту.",
        },
      ],
    },
    {
      id: "contactos",
      title: "Контакты",
      tagline: "Ваша база клиентов, синхронизированная с каждой беседой.",
      steps: [
        {
          title: "Просмотр и поиск контактов",
          description:
            "Список показывает все зарегистрированные контакты с именем и номером телефона. Используйте поиск для фильтрации по имени или номеру.",
        },
        {
          title: "Создание или редактирование контакта",
          description:
            "Используйте кнопку, чтобы добавить контакт вручную, или отредактируйте существующий, если нужно исправить имя или номер телефона.",
        },
        {
          title: "Импорт контактов из Excel",
          description:
            "Если у вас уже есть база клиентов, импортируйте её сразу, загрузив файл Excel/CSV с колонками имени и телефона, вместо того чтобы вводить их по одному.",
        },
        {
          title: "Открыть чат контакта",
          description:
            "Из списка контактов вы можете напрямую открыть беседу WhatsApp с этим человеком, не ища её в Беседах.",
        },
      ],
    },
    {
      id: "envios",
      title: "Кампании",
      tagline: "Массовая рассылка одобренных шаблонов WhatsApp с отслеживанием по кампаниям.",
      steps: [
        {
          title: "Что такое кампания",
          description:
            "Это массовая отправка одного и того же сообщения (одобренного WhatsApp шаблона) многим контактам одновременно — например, уведомление об акции или напоминание.",
        },
        {
          title: "Создание новой кампании",
          description:
            "Нажмите \"Новая кампания\", дайте ей название и выберите шаблон WhatsApp, который хотите отправить, из доступных для вашего рабочего пространства.",
        },
        {
          title: "Выбор получателей",
          description:
            "Отметьте галочками уже сохранённые контакты или загрузите Excel со списком получателей, если их много или они ещё не зарегистрированы.",
        },
        {
          title: "Заполните поля шаблона",
          description:
            "Если шаблону нужны переменные данные (например, дата или номер заказа), введите их в форме или добавьте как колонку в вашем Excel.",
        },
        {
          title: "Отправьте и отслеживайте",
          description:
            "После отправки кампания фиксируется в таблице с получателями, отправленными, неудачными и статусом. Используйте \"Просмотр\", чтобы проверить детали каждого отправленного сообщения.",
        },
      ],
    },
    {
      id: "citas",
      title: "Встречи",
      tagline: "Централизованное расписание звонков и видеозвонков с клиентами.",
      steps: [
        {
          title: "Вид календаря",
          description:
            "Просматривайте запланированные сессии по дням, неделям или месяцам, со сводкой о том, сколько у вас сегодня, предстоящих и завершённых.",
        },
        {
          title: "Запланировать новую сессию",
          description:
            "Нажмите \"Новая\", укажите клиента, телефон, тип (звонок или видеозвонок), дату и время. Можно добавить заметки о цели встречи.",
        },
        {
          title: "Пригласить клиента",
          description:
            "Используйте кнопку \"Пригласить\", чтобы отправить клиенту ссылку на запланированную встречу прямо через WhatsApp.",
        },
        {
          title: "Отслеживание",
          description:
            "Отмечайте сессию как завершённую или отменённую, чтобы ваше расписание и метрики оставались актуальными.",
        },
      ],
    },
    {
      id: "agentes",
      title: "Агенты",
      tagline: "Управляйте командой и отслеживайте её эффективность.",
      steps: [
        {
          title: "Просмотр команды",
          description:
            "Список показывает всех агентов рабочего пространства с их статусом в реальном времени: доступен, занят или не в сети.",
        },
        {
          title: "Добавить нового агента",
          description:
            "Нажмите кнопку, чтобы создать новую учётную запись: имя, email, временный пароль и роль (агент, супервизор или администратор).",
        },
        {
          title: "Эффективность по агентам",
          description:
            "Проверьте, сколько бесед обработал и завершил каждый агент — полезно для распределения нагрузки или оценки команды.",
        },
      ],
    },
    {
      id: "leads",
      title: "Лиды",
      tagline: "Потенциальные клиенты, захваченные до того, как станут контактами в CRM.",
      steps: [
        {
          title: "Что такое лид",
          description:
            "Лид — это потенциальный клиент, пришедший из формы на вашем сайте или внешней интеграции — это ещё не контакт, с которым можно напрямую общаться.",
        },
        {
          title: "Просмотр новых лидов",
          description:
            "Список показывает недавно захваченные лиды с их именем, email, телефоном и указанной компанией, если применимо.",
        },
        {
          title: "Конвертировать лид в контакт",
          description:
            "Когда лид квалифицирован, превратите его в контакт одним кликом, чтобы начать с ним беседу в WhatsApp.",
        },
        {
          title: "API-ключи для захвата лидов",
          description:
            "Создайте API-ключ в этом разделе, чтобы подключить форму на вашем сайте (или любую внешнюю систему), и лиды будут поступать сюда автоматически.",
        },
      ],
    },
    {
      id: "documentacion-api",
      title: "Документация API",
      tagline: "Для интеграции внешних систем с вашей CRM.",
      steps: [
        {
          title: "Для чего это нужно",
          description:
            "Здесь вы найдёте все доступные эндпоинты, чтобы разработчик мог подключить ваш сайт, интернет-магазин или другую систему к этой CRM.",
        },
        {
          title: "Аутентификация",
          description:
            "Почти все эндпоинты требуют сначала войти в систему, чтобы получить токен (access_token), который затем отправляется с каждым запросом.",
        },
        {
          title: "Просмотр по категориям",
          description:
            "Эндпоинты сгруппированы по темам — Контакты, Заказы, Сообщения, Лиды, Webhook-и — каждый с готовым примером кода для копирования.",
        },
        {
          title: "Исходящие webhook-и",
          description:
            "Зарегистрируйте свой URL, чтобы получать в реальном времени ответы WhatsApp и изменения статусов отправленных сообщений, без необходимости постоянно опрашивать API.",
        },
      ],
    },
    {
      id: "configuracion",
      title: "Настройки",
      tagline: "Настройте своё рабочее пространство.",
      steps: [
        {
          title: "Общие",
          description:
            "Измените название компании, загрузите логотип и задайте акцентный цвет, используемый в боковом меню и заголовке.",
        },
        {
          title: "Внешний вид и язык",
          description:
            "Выберите светлую, тёмную или автоматическую (системную) тему, а также язык всего интерфейса — испанский, английский, польский или русский.",
        },
        {
          title: "Уведомления",
          description:
            "Управляйте тем, хотите ли вы получать уведомления о новых сообщениях, назначениях бесед и упоминаниях во внутренних заметках.",
        },
        {
          title: "Интеграции и безопасность",
          description:
            "Вкладки Интеграции (WhatsApp, Facebook, Голос) и Безопасность зарезервированы для супер-администратора платформы.",
        },
      ],
    },
    {
      id: "estadisticas",
      title: "Статистика",
      tagline: "Пульс вашей работы — одним взглядом.",
      steps: [
        {
          title: "Общий обзор",
          description:
            "Узнайте сразу, сколько бесед открыто, сколько завершено и сколько агентов сейчас на связи.",
        },
        {
          title: "Метрики сообщений",
          description:
            "Проверьте, сколько сообщений отправлено, сколько прочитано и сколько ответов вы получили от клиентов.",
        },
        {
          title: "Быстрый доступ",
          description:
            "Отсюда вы можете сразу перейти к эффективности агентов, чтобы подробнее изучить работу вашей команды.",
        },
      ],
    },
    {
      id: "usuarios-plataforma",
      title: "Пользователи (платформа)",
      tagline: "Глобальный список всех пользователей, только для супер-админа.",
      steps: [
        {
          title: "Что показывает модуль",
          description:
            "Всех пользователей всех рабочих пространств в одной таблице. Это не то же самое, что Агенты, где видна только команда того пространства, в котором вы сейчас находитесь.",
        },
        {
          title: "Поиск и фильтры",
          description:
            "Поиск принимает имя, почту, ID пользователя или название пространства. Также можно фильтровать по пространству, роли и состоянию сессии: активная сессия, без сессии, никогда не входили или только супер-админы.",
        },
        {
          title: "Проверка последнего входа",
          description:
            "Колонка «Последний вход» показывает, как давно человек заходил, и точную дату. Она заполняется при каждом входе; тот, кто не входил с момента включения записи, отмечен янтарным цветом.",
        },
        {
          title: "Карточка пользователя",
          description:
            "«Подробнее» открывает полную карточку: роль и её права, пространство с тарифом, статусом и включёнными модулями, IP последнего входа, есть ли сейчас открытая сессия, назначенные диалоги и отправленные сообщения.",
        },
        {
          title: "Экспорт в CSV",
          description:
            "Кнопка «Экспорт CSV» скачивает именно то, что вы видите с текущими фильтрами — готово для аудита или отчёта.",
        },
      ],
    },
  ],
}
