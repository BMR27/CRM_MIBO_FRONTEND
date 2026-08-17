# Integración Facebook Messenger

> Esta integración ya **no** vive en el frontend (Next.js). Se movió al backend NestJS como
> parte del sistema multi-tenant: cada empresa configura su propia Página de Facebook desde
> Configuración > Integraciones en el CRM, en vez de usar variables de entorno globales.

## Dónde vive ahora

- Backend: `src/modules/facebook/` (`facebook.service.ts`, `facebook.controller.ts`, entidad
  `FacebookIntegration`).
- Webhook: `POST {NEXT_PUBLIC_BACKEND_URL}/api/facebook/webhook` (verificación vía `GET` con
  `hub.verify_token`, resuelto por empresa).
- Envío: `POST {NEXT_PUBLIC_BACKEND_URL}/api/facebook/send` (requiere JWT del agente).
- UI de configuración: `components/facebook-integration-section.tsx`, dentro de
  `app/inbox/configuracion/page.tsx` (tab "Integraciones").

## Configuración por empresa

1. Crear una app de Facebook en https://developers.facebook.com/apps (tipo "Business") y
   agregar el producto "Messenger".
2. En Configuración > Integraciones del CRM, ir a la sección "Facebook Messenger", ingresar el
   **Page ID** y el **Page Access Token**, y guardar.
3. El CRM muestra la URL del webhook y el **verify token** generado para esa empresa — copiarlos
   en el panel de Facebook (Messenger > Settings > Webhooks).
4. Suscribir la página a los eventos `messages` y `messaging_postbacks`.

Cada empresa tiene su propio Page ID/token y verify token, así que los mensajes entrantes se
enrutan automáticamente a la empresa correcta sin configuración adicional en el backend.
