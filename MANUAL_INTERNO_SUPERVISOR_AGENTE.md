# Manual Interno de Uso del CRM MIBO

Version: 1.0
Fecha: 2026-06-13
Formato: Manual operativo para capacitacion (Supervisor y Agente)

## 1. Objetivo
Este manual explica de forma practica:
- Como ingresar al sistema.
- Como usar cada modulo principal.
- Que puede y que no puede hacer cada rol (Supervisor y Agente).
- Flujo operativo diario recomendado.

## 2. Acceso al Sistema
## 2.1 Inicio de sesion
1. Abrir la URL del sistema.
2. Ingresar correo y contrasena.
3. Presionar Iniciar sesion.
4. Validar que el sistema redirija a la bandeja de Conversaciones.

Captura sugerida:
- Pantalla de login completa.

## 2.2 Cierre de sesion
1. Ir al perfil en la barra lateral.
2. Presionar Cerrar sesion.
3. Verificar retorno a Login.

Captura sugerida:
- Boton Cerrar sesion en sidebar.

## 3. Roles y Alcance
## 3.1 Supervisor
Puede:
- Ver todas las conversaciones.
- Asignar conversaciones a agentes.
- Ver modulo de Agentes.
- Gestionar operacion de Contactos.
- Ejecutar flujo de Envios masivos.

No puede:
- Crear agentes (segun configuracion actual de permisos).
- Eliminar agentes.
- Acceder al modulo Citas (visible para admin).

## 3.2 Agente
Puede:
- Ver y atender conversaciones asignadas.
- Responder mensajes en chat.
- Usar plantillas/macros y envio de media.
- Consultar contactos y documentacion API.

No puede:
- Ver modulo Agentes.
- Reconfigurar parametros administrativos.
- Gestionar conversaciones fuera de su asignacion.

## 4. Mapa de Modulos en la Interfaz
## 4.1 Conversaciones
Objetivo:
- Gestionar la atencion de clientes en tiempo real.

Uso paso a paso:
1. Entrar a Conversaciones.
2. Seleccionar un chat de la lista izquierda.
3. Leer historial en el panel central.
4. Responder en caja de mensaje.
5. Actualizar estado o prioridad cuando aplique.

Capturas sugeridas:
- Lista de conversaciones.
- Area de chat.
- Panel lateral de detalle.

## 4.2 Contactos
Objetivo:
- Registrar, consultar y mantener datos de clientes.

Uso paso a paso:
1. Abrir Contactos.
2. Buscar por nombre o telefono.
3. Crear o editar contacto.
4. Importar contactos si se requiere carga masiva.

Capturas sugeridas:
- Tabla de contactos.
- Modal/formulario de alta.
- Opcion de importacion.

## 4.3 Envios Masivos
Objetivo:
- Enviar campanas a multiples destinatarios.

Uso paso a paso:
1. Abrir Envios masivos.
2. Elegir base de contactos.
3. Seleccionar plantilla o redactar contenido.
4. Enviar ahora o programar.
5. Revisar estado de entregas.

Capturas sugeridas:
- Configuracion de campana.
- Pantalla de confirmacion de envio.
- Reporte/estadisticas de entrega.

## 4.4 Agentes (Solo Supervisor/Admin)
Objetivo:
- Monitorear carga y desempeno del equipo.

Uso paso a paso:
1. Entrar a Agentes.
2. Revisar metricas por agente.
3. Detectar sobrecarga o baja actividad.
4. Ajustar la distribucion de conversaciones desde Conversaciones.

Capturas sugeridas:
- Listado de agentes.
- Tarjetas o tablas de metricas.

## 4.5 Documentacion API
Objetivo:
- Consultar referencias funcionales de endpoints internos.

Uso paso a paso:
1. Abrir Documentacion API.
2. Elegir modulo (auth, conversaciones, contactos, etc.).
3. Revisar endpoint, metodo y proposito.

Capturas sugeridas:
- Vista general de documentacion API.

## 5. Flujo Operativo Diario
## 5.1 Flujo recomendado para Supervisor
1. Revisar conversaciones pendientes y sin asignar.
2. Priorizar casos criticos.
3. Asignar cada caso al agente correspondiente.
4. Monitorear avance en modulo Agentes.
5. Ejecutar campanas (si aplica).
6. Cerrar dia con revision de conversaciones resueltas.

## 5.2 Flujo recomendado para Agente
1. Abrir bandeja de conversaciones asignadas.
2. Responder por orden de prioridad.
3. Registrar informacion clave en comentarios/contexto interno.
4. Marcar resuelto cuando termina el caso.
5. Escalar al supervisor cuando el caso excede alcance.

## 6. Procesos Clave
## 6.1 Asignar una conversacion (Supervisor)
1. Entrar a Conversaciones.
2. Seleccionar chat.
3. Elegir agente en la accion de asignacion.
4. Confirmar y validar que cambie el responsable.

## 6.2 Responder un mensaje (Agente o Supervisor)
1. Abrir conversacion.
2. Escribir respuesta o seleccionar plantilla.
3. Adjuntar archivo si se requiere.
4. Enviar.
5. Confirmar que el mensaje aparezca en historial.

## 6.3 Cambiar estado de una conversacion
1. Seleccionar conversacion.
2. Cambiar de activa a resuelta (o viceversa segun flujo).
3. Guardar cambios.
4. Validar actualizacion en lista.

## 6.4 Importar contactos
1. Ir a Contactos.
2. Elegir Importar.
3. Cargar archivo con formato esperado.
4. Confirmar importacion.
5. Revisar resumen de registros procesados.

## 7. Endpoints Operativos Mas Usados
## 7.1 Auth
- POST /api/auth/login: iniciar sesion.
- GET /api/auth/me: obtener usuario actual y rol.
- POST /api/auth/logout: cerrar sesion.

## 7.2 Conversaciones y Mensajes
- GET /api/conversations: listar conversaciones.
- GET /api/conversations/[id]: detalle de conversacion.
- POST /api/conversations/[id]/assign: asignar agente.
- PUT /api/conversations/[id]/status: cambiar estado.
- PUT /api/conversations/[id]/priority: cambiar prioridad.
- GET /api/conversations/[id]/messages: listar mensajes.
- POST /api/conversations/[id]/messages: enviar mensaje.
- POST /api/messages/mark-read/[conversationId]: marcar leidos.

## 7.3 Contactos
- GET /api/contacts: listar contactos.
- POST /api/contacts: crear contacto.
- PATCH /api/contacts/[id]: actualizar contacto.
- DELETE /api/contacts/[id]: eliminar contacto.
- POST /api/contacts/import: importacion masiva.

## 7.4 Agentes
- GET /api/users/agents: listar agentes.
- GET /api/users/agents/stats: metricas operativas.

## 7.5 Campanas
- GET /api/campaigns: listar campanas.
- POST /api/campaigns/send: enviar campana.
- POST /api/campaigns/schedule: programar campana.
- GET /api/campaigns/stats: estadisticas.

## 8. Checklist de Capacitacion
## 8.1 Checklist Supervisor
- Puede iniciar/cerrar sesion.
- Puede ver todas las conversaciones.
- Puede asignar conversaciones.
- Puede consultar modulo Agentes.
- Puede operar Contactos y Envios masivos.

## 8.2 Checklist Agente
- Puede iniciar/cerrar sesion.
- Solo ve conversaciones asignadas.
- Puede responder mensajes y adjuntar media.
- Puede cambiar estado de conversacion cuando aplica.
- Puede consultar contactos.

## 9. Troubleshooting Rapido
- No veo una seccion del menu:
  revisar rol asignado y sesion activa.
- No puedo abrir una conversacion:
  validar si esta asignada al agente autenticado.
- Error al enviar mensaje:
  validar conectividad de canal WhatsApp/Facebook y configuracion API.
- Error en importacion de contactos:
  validar formato de archivo y columnas obligatorias.

## 10. Control de Cambios
- v1.0: Documento inicial para uso interno y capacitacion.

Fin del manual.
