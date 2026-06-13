# Documentacion Integral del Sistema CRM MIBO

## 1. Objetivo
Este documento explica de forma integral:
- Como funciona el sistema de punta a punta.
- Como se usa cada seccion de la interfaz.
- Que puede hacer cada rol (Supervisor y Agente).
- Que hace cada endpoint del sistema (Frontend API y Backend API).

Alcance:
- Frontend: Next.js (rutas en `app/` y `app/api/`).
- Backend: NestJS (modulos en `src/modules/`).

---

## 2. Arquitectura General
Flujo tecnico simplificado:
1. Usuario inicia sesion en Frontend.
2. Frontend crea/sincroniza sesion y obtiene rol.
3. Interfaz habilita secciones segun rol.
4. Frontend consume endpoints internos (`/api/...`).
5. Esos endpoints consultan DB directa o integran con Backend/Twilio/Meta segun modulo.
6. Webhooks de WhatsApp/Facebook insertan mensajes entrantes y actualizan conversaciones.

Canales principales:
- WhatsApp (Cloud API/Twilio).
- Facebook Messenger.

Entidades principales:
- Usuarios, roles, conversaciones, mensajes, contactos, ordenes, macros, campanas, sesiones/citas.

---

## 3. Roles y Permisos Operativos

## 3.1 Supervisor
Permisos practicos:
- Ver conversaciones (todas).
- Asignar conversaciones.
- Gestionar agentes (ver y editar).
- Ver tab de Agentes.
- Ver Configuracion (sin edicion avanzada).
- Usar Contactos y Envios masivos.

Limitaciones:
- No crear agentes (segun matriz de permisos frontend).
- No eliminar agentes.
- No tiene modulo Citas en sidebar (reservado a admin).

## 3.2 Agente
Permisos practicos:
- Ver y atender sus conversaciones asignadas.
- Enviar mensajes, plantillas y media dentro de conversaciones permitidas.
- Consultar contactos y documentacion API.

Limitaciones:
- No ve tab Agentes.
- No ve Citas.
- No gestiona configuraciones administrativas.
- No debe acceder a conversaciones de otros agentes (validado en endpoint de detalle de conversacion).

## 3.3 Donde se aplican permisos
- Sidebar condicional por rol: `components/inbox-sidebar.tsx`.
- Resolucion de rol actual: `hooks/use-user-role.ts`.
- Matriz de acciones por rol: `lib/permissions.ts`.
- Guard visual reutilizable: `components/protected-component.tsx`.
- Restriccion fuerte en API para casos criticos (ejemplo: acceso de agente a conversacion no asignada).

---

## 4. Proceso de Uso por Rol

## 4.1 Flujo diario de Supervisor
1. Entrar a Conversaciones.
2. Revisar bandeja completa (sin filtro por asignacion).
3. Priorizar y asignar conversaciones a agentes.
4. Monitorear rendimiento en modulo Agentes.
5. Mantener base de contactos (alta/edicion/importacion).
6. Ejecutar campanas de envios masivos cuando aplique.
7. Consultar Documentacion API para integraciones o pruebas.

## 4.2 Flujo diario de Agente
1. Entrar a Conversaciones.
2. Trabajar solo conversaciones asignadas.
3. Responder con texto, macros, plantillas o media.
4. Cambiar estado de conversacion cuando termina (resuelta).
5. Consultar historial del cliente y datos auxiliares.

---

## 5. Modulos de Interfaz y Como Usarlos

## 5.1 Conversaciones (`/inbox`)
Que hace:
- Centro de trabajo principal de atencion.
- Lista de conversaciones + area de chat + panel lateral de detalle.

Como se usa:
1. Seleccionar conversacion en la columna izquierda.
2. Responder en panel de chat (texto, plantillas o media).
3. Cambiar estado/prioridad o asignacion segun permisos.
4. Revisar informacion complementaria en panel derecho.

Diferencia por rol:
- Supervisor: puede ver todas y reasignar.
- Agente: solo asignadas (`onlyAssigned=true`).

## 5.2 Contactos (`/inbox/contactos`)
Que hace:
- Gestion de contactos y alta masiva.

Como se usa:
1. Buscar o filtrar contactos existentes.
2. Crear o editar contacto.
3. Importar archivo para carga masiva.
4. Abrir conversacion desde contacto cuando aplique.

Diferencia por rol:
- Supervisor: administracion operativa completa.
- Agente: consumo operativo (segun restricciones vigentes en API/UX).

## 5.3 Envios Masivos (`/inbox/envios`)
Que hace:
- Creacion, programacion y seguimiento de campanas.

Como se usa:
1. Seleccionar lista de destinatarios o importar.
2. Elegir plantilla/cuerpo de campana.
3. Enviar de inmediato o programar.
4. Consultar estado de entrega y destinatarios.

Diferencia por rol:
- Supervisor: uso recomendado para ejecucion de campanas.
- Agente: normalmente lectura/consulta, dependiendo politicas internas.

## 5.4 Agentes (`/inbox/agentes`)
Que hace:
- Monitoreo de equipo y metricas por agente.

Como se usa:
1. Revisar lista de agentes y conversaciones activas/resueltas.
2. Abrir detalle de conversaciones asignadas.
3. Ajustar operacion (reasignacion/seguimiento) segun permisos.

Diferencia por rol:
- Supervisor: acceso permitido.
- Agente: acceso denegado.

## 5.5 Citas (`/inbox/citas`)
Que hace:
- Gestion de sesiones/citas.

Diferencia por rol:
- En sidebar visible para admin.
- No visible para supervisor/agente segun reglas actuales.

## 5.6 Configuracion (`/inbox/configuracion`)
Que hace:
- Parametros de sistema y configuraciones administrativas.

Diferencia por rol:
- Admin: acceso completo.
- Supervisor/Agente: acceso limitado o redireccion segun pagina.

## 5.7 Documentacion API (`/inbox/documentacion-api`)
Que hace:
- Referencia interna de endpoints y usos operativos.

Como se usa:
1. Navegar secciones por categoria.
2. Revisar payloads y propositos.
3. Usar como base para pruebas manuales o integracion.

---

## 6. Catalogo de Endpoints Frontend API (Next)
Nota: estos endpoints estan en `CRM_MIBO_FRONTEND/app/api`.

## 6.1 Auth
- POST `/api/auth/login`: autentica usuario y crea contexto de sesion.
- POST `/api/auth/logout`: cierra sesion.
- GET `/api/auth/me`: devuelve usuario actual y rol.
- POST `/api/auth/signup`: registra usuario.
- GET `/api/auth/verify-email`: verifica correo con codigo/token.
- POST `/api/auth/resend-verification`: reenvia verificacion.
- POST `/api/auth/session`: crea/actualiza estado de sesion.

## 6.2 Conversaciones y Mensajes
- GET `/api/conversations`: lista conversaciones (filtra por rol cuando aplica).
- POST `/api/conversations/ensure`: crea conversacion si no existe.
- GET `/api/conversations/[id]`: detalle de conversacion con validaciones de acceso.
- DELETE `/api/conversations/[id]`: elimina conversacion.
- POST `/api/conversations/[id]/assign`: asigna agente a conversacion.
- PUT `/api/conversations/[id]/status`: cambia estado de conversacion.
- PUT `/api/conversations/[id]/priority`: cambia prioridad.
- GET `/api/conversations/[id]/messages`: obtiene mensajes de la conversacion.
- POST `/api/conversations/[id]/messages`: envia mensaje en la conversacion.
- PUT `/api/conversations/[id]/messages/[messageId]`: edita mensaje.
- DELETE `/api/conversations/[id]/messages/[messageId]`: elimina mensaje.
- POST `/api/messages/mark-read/[conversationId]`: marca mensajes como leidos.
- POST `/api/conversations/[id]/comments`: crea comentario interno.
- PUT `/api/conversations/[id]/comments`: edita comentario interno.
- DELETE `/api/conversations/[id]/comments`: elimina comentario interno.
- POST `/api/conversations/[id]/send-media`: envia archivo multimedia.

## 6.3 Contactos
- GET `/api/contacts`: lista contactos.
- POST `/api/contacts`: crea contacto.
- DELETE `/api/contacts`: elimina contacto (segun body/filtros).
- PATCH `/api/contacts/[id]`: actualiza contacto por id.
- DELETE `/api/contacts/[id]`: elimina contacto por id.
- POST `/api/contacts/import`: importa contactos de archivo.

## 6.4 Usuarios/Agentes
- GET `/api/users/agents`: lista agentes para asignacion y gestion.
- GET `/api/users/agents/stats`: metricas operativas por agente.

## 6.5 Macros
- GET `/api/macros`: lista macros.
- POST `/api/macros`: crea macro.
- POST `/api/macros/[id]/use`: incrementa uso de macro.

## 6.6 Campanas (Envios Masivos)
- GET `/api/campaigns`: lista campanas.
- DELETE `/api/campaigns`: elimina campana.
- POST `/api/campaigns/send`: envia campana.
- POST `/api/campaigns/schedule`: programa campana.
- GET `/api/campaigns/stats`: estadisticas de campanas.
- GET `/api/campaigns/delivery`: detalle de entrega.
- GET `/api/campaigns/[id]/recipients`: destinatarios por campana.

## 6.7 WhatsApp/Facebook/Media
- GET `/api/whatsapp/webhook`: handshake/verificacion webhook.
- POST `/api/whatsapp/webhook`: recepcion de eventos entrantes.
- POST `/api/whatsapp/send`: envio de mensaje WhatsApp.
- POST `/api/whatsapp/send-template`: envio de plantilla WhatsApp.
- GET `/api/whatsapp/media/[mediaId]`: descarga media de WhatsApp.
- GET `/api/whatsapp/webhook-logs`: consulta bitacora de webhooks.
- GET `/api/facebook/webhook`: handshake/verificacion webhook.
- POST `/api/facebook/webhook`: recepcion de eventos Facebook.
- POST `/api/facebook/send`: envio de mensaje Facebook.
- GET `/api/media/[id]`: entrega de archivo media interno.
- GET `/api/twilio/media-by-message/[messageSid]`: media asociada a mensaje Twilio.

## 6.8 Citas/Sesiones, Llamadas, Ordenes, Utilitarios
- GET `/api/sessions`: lista sesiones/citas.
- POST `/api/sessions`: crea sesion/cita.
- PUT `/api/sessions/[id]`: actualiza sesion/cita.
- DELETE `/api/sessions/[id]`: elimina sesion/cita.
- GET `/api/calls`: lista llamadas.
- POST `/api/calls`: crea llamada.
- PUT `/api/calls/[id]`: actualiza llamada.
- DELETE `/api/calls/[id]`: elimina llamada.
- GET `/api/orders`: lista ordenes.
- GET `/api/orders/[id]`: detalle de orden.
- POST `/api/send-wa-template`: envio de plantilla WA (ruta auxiliar).
- POST `/api/migrate`: ejecutar proceso de migracion (entornos de soporte).
- GET `/api/migrate`: consultar estado de migracion.

---

## 7. Catalogo de Endpoints Backend API (NestJS)
Nota: estos endpoints viven en `CRM_MIBO_BACKEND/src/modules`.

## 7.1 Auth
- POST `/auth/signup`: registro de usuario.
- POST `/auth/login`: autenticacion y JWT.
- GET `/auth/me`: usuario autenticado.
- POST `/auth/test-token`: token de prueba.

## 7.2 Users
- GET `/users`: listar usuarios.
- GET `/users/agents`: listar usuarios con rol agente.
- GET `/users/:id`: detalle de usuario.
- POST `/users`: crear usuario.
- PUT `/users/:id`: actualizar usuario.
- PUT `/users/:id/password`: actualizar password.
- DELETE `/users/:id`: eliminar usuario.

## 7.3 Conversations
- GET `/conversations`: listar conversaciones.
- POST `/conversations`: crear conversacion.
- GET `/conversations/:id`: detalle de conversacion.
- GET `/conversations/:id/messages`: mensajes de conversacion.
- GET `/conversations/contact/:contactId`: conversaciones por contacto.
- PATCH `/conversations/:id`: actualizar conversacion.
- POST `/conversations/:id/assign`: asignar agente.
- PUT `/conversations/:id/priority`: cambiar prioridad.
- PUT `/conversations/:id/status`: cambiar estado.
- DELETE `/conversations/:id`: eliminar conversacion.
- POST `/conversations/:id/messages`: crear mensaje asociado.

## 7.4 Messages y Bulk
- POST `/messages`: crear mensaje.
- GET `/messages`: listar mensajes.
- GET `/messages/:id`: detalle de mensaje.
- GET `/messages/conversation/:conversationId`: mensajes por conversacion.
- PATCH `/messages/:id`: actualizar mensaje.
- DELETE `/messages/:id`: eliminar mensaje.
- POST `/messages/mark-read/:conversationId`: marcar como leidos.
- POST `/messages/bulk`: envio masivo por JSON/Excel (carga de archivo).

## 7.5 WhatsApp
- GET `/whatsapp/webhook`: verificar webhook.
- POST `/whatsapp/webhook`: recibir eventos webhook.
- GET `/whatsapp/health`: estado de integracion.
- POST `/whatsapp/send`: enviar mensaje.
- POST `/whatsapp/send-template`: enviar plantilla.
- POST `/whatsapp/send-media`: enviar multimedia.
- GET `/whatsapp/media/:mediaId`: recuperar multimedia.
- GET `/whatsapp/message-status`: consultar estado de mensaje.
- GET `/whatsapp/phone-numbers`: listar numeros disponibles.

## 7.6 Calls
- GET `/calls`: listar llamadas.

## 7.7 Contacts
- POST `/api/contacts`: crear contacto.
- GET `/api/contacts`: listar contactos.
- GET `/api/contacts/:id`: detalle de contacto.
- GET `/api/contacts/phone/:phone`: buscar por telefono.
- PATCH `/api/contacts/:id`: actualizar contacto.
- DELETE `/api/contacts/:id`: eliminar contacto.

## 7.8 Macros
- POST `/api/macros`: crear macro.
- GET `/api/macros`: listar macros.
- GET `/api/macros/:id`: detalle macro.
- GET `/api/macros/shortcut/:shortcut`: buscar por shortcut.
- PATCH `/api/macros/:id`: actualizar macro.
- DELETE `/api/macros/:id`: eliminar macro.

## 7.9 Orders
- POST `/api/orders`: crear orden.
- GET `/api/orders`: listar ordenes.
- GET `/api/orders/:id`: detalle de orden.
- GET `/api/orders/contact/:contactId`: ordenes por contacto.
- PATCH `/api/orders/:id`: actualizar orden.
- DELETE `/api/orders/:id`: eliminar orden.

## 7.10 Conversation Tags
- POST `/api/conversation-tags`: crear etiqueta.
- GET `/api/conversation-tags`: listar etiquetas.
- GET `/api/conversation-tags/:id`: detalle etiqueta.
- GET `/api/conversation-tags/conversation/:conversationId`: etiquetas por conversacion.
- DELETE `/api/conversation-tags/:id`: eliminar etiqueta.

## 7.11 Roles
- GET `/roles`: listar roles.
- GET `/roles/:id`: detalle de rol.
- POST `/roles`: crear rol.
- PUT `/roles/:id`: actualizar rol.
- DELETE `/roles/:id`: eliminar rol.
- POST `/roles/seed`: crear roles base.

---

## 8. Reglas de Operacion Recomendadas para Supervisor y Agente

## 8.1 Supervisor
- Mantener SLA de respuesta: revisar backlog varias veces al dia.
- Reasignar conversaciones sin duenio o con demora.
- Validar calidad de respuesta con muestreo diario.
- Revisar metricas de agentes para balanceo de carga.
- Ejecutar campanas en ventanas horarias controladas.

## 8.2 Agente
- Trabajar solo conversaciones asignadas.
- Mantener estatus actualizado (activa/resuelta).
- Usar macros/plantillas para estandarizar respuestas.
- Registrar contexto interno (comentarios) cuando aplique.
- Escalar casos complejos al supervisor con trazabilidad.

---

## 9. Checklist de Onboarding Operativo

## 9.1 Supervisor
1. Confirmar acceso a modulo Agentes.
2. Probar asignacion de conversacion.
3. Probar cambio de prioridad y estado.
4. Probar consulta y carga de contactos.
5. Probar flujo de campana (sandbox).

## 9.2 Agente
1. Confirmar que solo visualiza asignadas.
2. Enviar mensaje de texto y plantilla.
3. Adjuntar media en una conversacion.
4. Marcar una conversacion como resuelta.
5. Validar lectura de historial del contacto.

---

## 10. Notas Tecnicas Importantes
- La UI aplica restricciones por rol para experiencia de usuario, pero la seguridad real debe vivir en API.
- Existen endpoints publicos de webhook por naturaleza de integracion; deben protegerse con validaciones de firma/token segun proveedor.
- Mantener sincronizados nombres de rol (admin/supervisor/agent) entre DB, backend y frontend evita errores de autorizacion.

Fin del documento.
