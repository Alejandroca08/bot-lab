const translations = {
  // ─── Login ───
  'login.subtitle': { en: 'WhatsApp Bot Testing Platform', es: 'Plataforma de pruebas para bots de WhatsApp' },
  'login.email': { en: 'Email', es: 'Correo' },
  'login.emailPlaceholder': { en: 'you@example.com', es: 'tu@email.com' },
  'login.password': { en: 'Password', es: 'Contraseña' },
  'login.passwordPlaceholder': { en: 'Enter your password', es: 'Ingresa tu contraseña' },
  'login.submit': { en: 'Sign In', es: 'Iniciar sesión' },
  'login.loading': { en: 'Signing in...', es: 'Iniciando sesión...' },
  'login.error': { en: 'Failed to sign in', es: 'Error al iniciar sesión' },
  'login.footer': { en: 'Contact your admin for access credentials', es: 'Contacta al administrador para obtener tus credenciales' },

  // ─── Sidebar / Nav ───
  'nav.projects': { en: 'Projects', es: 'Proyectos' },
  'nav.simulator': { en: 'Simulator', es: 'Simulador' },
  'nav.testlab': { en: 'Test Lab', es: 'Test Lab' },
  'nav.clients': { en: 'Clients', es: 'Clientes' },
  'nav.dashboard': { en: 'Dashboard', es: 'Dashboard' },
  'nav.adminPanel': { en: 'ADMIN PANEL', es: 'PANEL ADMIN' },
  'nav.admin': { en: 'Admin', es: 'Admin' },
  'nav.activeProject': { en: 'Active Project', es: 'Proyecto activo' },
  'nav.noProjects': { en: 'No projects yet', es: 'Aún no hay proyectos' },
  'nav.signOut': { en: 'Sign Out', es: 'Cerrar sesión' },

  // ─── Project Settings (client view) ───
  'projectInfo.title': { en: 'Project Info', es: 'Info del proyecto' },
  'projectInfo.subtitle': { en: 'Your assigned project configuration', es: 'Configuración de tu proyecto asignado' },
  'projectInfo.projectName': { en: 'Project Name', es: 'Nombre del proyecto' },
  'projectInfo.clientName': { en: 'Client Name', es: 'Nombre del agente' },
  'projectInfo.webhookUrl': { en: 'Webhook URL', es: 'Webhook URL' },
  'projectInfo.configuredByAdmin': { en: 'Configured by admin', es: 'Configurado por el administrador' },
  'projectInfo.webhookFormat': { en: 'Webhook Format', es: 'Formato de webhook' },
  'projectInfo.agentPhone': { en: 'Agent Phone', es: 'Teléfono del agente' },
  'projectInfo.noProject': { en: 'No Project Assigned', es: 'Sin proyecto asignado' },
  'projectInfo.noProjectDesc': { en: 'Contact your administrator to be assigned a project', es: 'Contacta al administrador para que te asigne un proyecto' },

  // ─── Project Settings (admin view) ───
  'projects.title': { en: 'Projects', es: 'Proyectos' },
  'projects.subtitle': { en: 'Configure your WhatsApp bot projects and webhook endpoints', es: 'Configura tus proyectos de bots de WhatsApp y endpoints de webhook' },
  'projects.new': { en: 'New Project', es: 'Nuevo proyecto' },
  'projects.none': { en: 'No Projects Yet', es: 'Aún no hay proyectos' },
  'projects.noneDesc': { en: 'Create your first project to start testing WhatsApp bots', es: 'Crea tu primer proyecto para comenzar a probar bots de WhatsApp' },
  'projects.active': { en: 'ACTIVE', es: 'ACTIVO' },
  'projects.agent': { en: 'Agent', es: 'Agente' },
  'projects.confirmDelete': { en: 'Delete this project?', es: '¿Eliminar este proyecto?' },

  // ─── Project Form ───
  'projectForm.editTitle': { en: 'Edit Project', es: 'Editar proyecto' },
  'projectForm.newTitle': { en: 'New Project', es: 'Nuevo proyecto' },
  'projectForm.projectName': { en: 'Project Name', es: 'Nombre del proyecto' },
  'projectForm.projectNamePlaceholder': { en: 'e.g., Eventos Rosario', es: 'Ej: Eventos Rosario' },
  'projectForm.agentName': { en: 'Agent Name', es: 'Nombre del agente' },
  'projectForm.agentNamePlaceholder': { en: 'e.g., Gabriela', es: 'Ej: Gabriela' },
  'projectForm.webhookUrl': { en: 'Webhook URL', es: 'URL del webhook' },
  'projectForm.payloadFormat': { en: 'Payload Format', es: 'Formato de payload' },
  'projectForm.agentPhone': { en: 'Agent Phone Number', es: 'Teléfono del agente' },
  'projectForm.cancel': { en: 'Cancel', es: 'Cancelar' },
  'projectForm.update': { en: 'Update Project', es: 'Actualizar proyecto' },
  'projectForm.create': { en: 'Create Project', es: 'Crear proyecto' },
  'projectForm.required': { en: 'Required', es: 'Requerido' },
  'projectForm.invalidUrl': { en: 'Must be a valid URL', es: 'Debe ser una URL válida' },

  // ─── Simulator / ChatWindow ───
  'chat.noProject': { en: 'No Project Selected', es: 'Sin proyecto seleccionado' },
  'chat.noProjectDesc': { en: 'Select or create a project in Settings first', es: 'Selecciona o crea un proyecto en Configuración' },
  'chat.selectConversation': { en: 'Select or create a conversation', es: 'Selecciona o crea una conversación' },
  'chat.pasteResponse': { en: 'Paste Response', es: 'Pegar respuesta' },
  'chat.agent': { en: 'Agent', es: 'Agente' },
  'chat.newConversation': { en: 'New Conversation', es: 'Nueva conversación' },

  // ─── New Conversation Modal ───
  'newConv.title': { en: 'New conversation', es: 'Nueva conversación' },
  'newConv.label': { en: 'Test name', es: 'Nombre de la prueba' },
  'newConv.placeholder': { en: 'E.g., Full reservation test', es: 'Ej: Prueba reserva completa' },
  'newConv.hint': { en: 'A unique phone number will be generated for this test', es: 'Se generará un número de teléfono único para esta prueba' },
  'newConv.cancel': { en: 'Cancel', es: 'Cancelar' },
  'newConv.create': { en: 'Create', es: 'Crear' },

  // ─── Conversation List ───
  'convList.title': { en: 'Conversations', es: 'Conversaciones' },
  'convList.new': { en: 'New', es: 'Nueva' },
  'convList.none': { en: 'No conversations yet', es: 'Aún no hay conversaciones' },
  'convList.confirmDelete': { en: 'Delete this conversation?', es: '¿Eliminar esta conversación?' },
  'convList.rename': { en: 'Rename', es: 'Renombrar' },
  'convList.delete': { en: 'Delete', es: 'Eliminar' },

  // ─── Message Input ───
  'input.placeholder': { en: 'Type a message...', es: 'Escribe un mensaje...' },

  // ─── Image Attachment ───
  'image.selectPrompt': { en: 'Click to select an image', es: 'Haz clic para seleccionar una imagen' },
  'image.captionPlaceholder': { en: 'Add a caption...', es: 'Agregar descripción...' },

  // ─── Voice Recorder ───
  'voice.holdToRecord': { en: 'Hold to record voice memo', es: 'Mantén presionado para grabar nota de voz' },

  // ─── Bot Status ───
  'botStatus.on': { en: 'Bot ON', es: 'Bot activo' },
  'botStatus.off': { en: 'Bot OFF', es: 'Bot apagado' },

  // ─── Agent Panel ───
  'agentPanel.title': { en: 'Agent Panel', es: 'Panel de agente' },
  'agentPanel.botActive': { en: 'Bot activated', es: 'Bot activado' },
  'agentPanel.botDeactivated': { en: 'Bot deactivated — {name} is responding', es: 'Bot desactivado — {name} está respondiendo' },
  'agentPanel.replyAs': { en: 'Reply as {name}...', es: 'Responder como {name}...' },
  'agentPanel.handoffAlert': { en: 'Handoff requested', es: 'Handoff solicitado' },
  'agentPanel.handoffDismiss': { en: 'Dismiss', es: 'Cerrar' },

  // ─── Paste Response Modal ───
  'paste.title': { en: 'Paste Bot Response', es: 'Pegar respuesta del bot' },
  'paste.plainText': { en: 'Plain Text', es: 'Texto' },
  'paste.json': { en: 'JSON', es: 'JSON' },
  'paste.jsonPlaceholder': { en: 'Paste the JSON response from n8n...', es: 'Pega la respuesta JSON de n8n...' },
  'paste.textPlaceholder': { en: "Paste the bot's response text...", es: 'Pega la respuesta del bot...' },
  'paste.cancel': { en: 'Cancel', es: 'Cancelar' },
  'paste.add': { en: 'Add Response', es: 'Agregar respuesta' },

  // ─── Message Bubble ───
  'bubble.bot': { en: 'Bot', es: 'Bot' },
  'bubble.reactivated': { en: '{name} reactivated the bot', es: '{name} reactivó el bot' },

  // ─── Test Lab ───
  'testlab.noProject': { en: 'No Project Selected', es: 'Sin proyecto seleccionado' },
  'testlab.noProjectDesc': { en: 'Select a project first', es: 'Selecciona un proyecto primero' },
  'testlab.title': { en: 'Test Lab', es: 'Test Lab' },
  'testlab.subtitle': { en: 'Review and annotate conversations', es: 'Revisa y anota conversaciones' },
  'testlab.selectConversation': { en: 'Select conversation...', es: 'Seleccionar conversación...' },
  'testlab.export': { en: 'Export', es: 'Exportar' },
  'testlab.selectToReview': { en: 'Select a conversation to review', es: 'Selecciona una conversación para revisar' },
  'testlab.allClients': { en: 'All Clients', es: 'Todos los clientes' },

  // ─── Annotation Form ───
  'annotation.category': { en: 'Category', es: 'Categoría' },
  'annotation.selectCategory': { en: 'Select...', es: 'Seleccionar...' },
  'annotation.severity': { en: 'Severity', es: 'Severidad' },
  'annotation.note': { en: 'Note', es: 'Nota' },
  'annotation.notePlaceholder': { en: "What's the issue?", es: '¿Cuál es el problema?' },
  'annotation.suggestion': { en: 'Suggestion (optional)', es: 'Sugerencia (opcional)' },
  'annotation.suggestionPlaceholder': { en: 'What should the bot have said?', es: '¿Qué debería haber dicho el bot?' },
  'annotation.cancel': { en: 'Cancel', es: 'Cancelar' },
  'annotation.add': { en: 'Add Annotation', es: 'Agregar anotación' },

  // ─── Annotated Message ───
  'sender.customer': { en: 'Customer', es: 'Cliente' },
  'sender.bot': { en: 'Bot', es: 'Bot' },
  'sender.agent': { en: 'Agent', es: 'Agente' },
  'annotatedMsg.voiceMemo': { en: 'Voice memo', es: 'Nota de voz' },
  'annotatedMsg.suggestion': { en: 'Suggestion', es: 'Sugerencia' },

  // ─── Conversation Summary ───
  'summary.title': { en: 'Conversation Summary', es: 'Resumen de conversación' },
  'summary.customer': { en: 'Customer', es: 'Cliente' },
  'summary.bot': { en: 'Bot', es: 'Bot' },
  'summary.agent': { en: 'Agent', es: 'Agente' },
  'summary.duration': { en: 'Duration', es: 'Duración' },
  'summary.annotations': { en: 'Annotations', es: 'Anotaciones' },
  'summary.botActive': { en: 'Active', es: 'Activo' },
  'summary.botDeactivated': { en: 'Deactivated', es: 'Desactivado' },
  'summary.started': { en: 'Started', es: 'Inicio' },

  // ─── Export Options ───
  'export.label': { en: 'Export:', es: 'Exportar:' },
  'export.json': { en: 'JSON File', es: 'Archivo JSON' },
  'export.markdown': { en: 'Copy Markdown', es: 'Copiar Markdown' },
  'export.summary': { en: 'Summary Only', es: 'Solo resumen' },
  'export.copied': { en: 'Copied to clipboard!', es: '¡Copiado al portapapeles!' },
  'export.summaryCopied': { en: 'Summary copied to clipboard!', es: '¡Resumen copiado al portapapeles!' },

  // ─── Annotation Categories ───
  'cat.tone': { en: 'Tone', es: 'Tono' },
  'cat.accuracy': { en: 'Accuracy', es: 'Precisión' },
  'cat.flow': { en: 'Flow', es: 'Flujo' },
  'cat.missing_info': { en: 'Missing Info', es: 'Info faltante' },
  'cat.too_long': { en: 'Too Long', es: 'Muy largo' },
  'cat.too_short': { en: 'Too Short', es: 'Muy corto' },
  'cat.wrong_language': { en: 'Wrong Language', es: 'Idioma incorrecto' },
  'cat.hallucination': { en: 'Hallucination', es: 'Alucinación' },
  'cat.other': { en: 'Other', es: 'Otro' },

  // ─── Annotation Severities ───
  'sev.minor': { en: 'Minor', es: 'Menor' },
  'sev.medium': { en: 'Medium', es: 'Medio' },
  'sev.critical': { en: 'Critical', es: 'Crítico' },

  // ─── Client Manager (admin) ───
  'clients.title': { en: 'Clients', es: 'Clientes' },
  'clients.subtitle': { en: 'Manage client access and project assignments', es: 'Administra el acceso y asignación de proyectos' },
  'clients.invite': { en: 'Invite Client', es: 'Invitar cliente' },
  'clients.inviteTitle': { en: 'Invite New Client', es: 'Invitar nuevo cliente' },
  'clients.name': { en: 'Client Name', es: 'Nombre del cliente' },
  'clients.namePlaceholder': { en: 'e.g., Maria', es: 'Ej: María' },
  'clients.email': { en: 'Email', es: 'Correo' },
  'clients.emailPlaceholder': { en: 'client@email.com', es: 'cliente@email.com' },
  'clients.assignProject': { en: 'Assign Project', es: 'Asignar proyecto' },
  'clients.selectProject': { en: 'Select project...', es: 'Seleccionar proyecto...' },
  'clients.tempPassword': { en: 'Temporary Password', es: 'Contraseña temporal' },
  'clients.tempPasswordPlaceholder': { en: 'Min 6 characters', es: 'Mínimo 6 caracteres' },
  'clients.cancel': { en: 'Cancel', es: 'Cancelar' },
  'clients.creating': { en: 'Creating...', es: 'Creando...' },
  'clients.create': { en: 'Create Client', es: 'Crear cliente' },
  'clients.createError': { en: 'Failed to create client', es: 'Error al crear el cliente' },
  'clients.none': { en: 'No Clients Yet', es: 'Aún no hay clientes' },
  'clients.noneDesc': { en: 'Invite your first client to start collecting feedback', es: 'Invita a tu primer cliente para comenzar a recopilar feedback' },
  'clients.assignPlaceholder': { en: 'Assign project...', es: 'Asignar proyecto...' },
  'clients.unassigned': { en: 'Unassigned', es: 'Sin asignar' },
  'clients.convos': { en: 'convos', es: 'convos' },
  'clients.flags': { en: 'flags', es: 'flags' },
  'clients.conversations': { en: 'Conversations', es: 'Conversaciones' },
  'clients.critical': { en: 'Critical', es: 'Crítico' },
  'clients.medium': { en: 'Medium', es: 'Medio' },
  'clients.minor': { en: 'Minor', es: 'Menor' },
  'clients.lastActive': { en: 'Last active', es: 'Última actividad' },
  'clients.totalFlags': { en: 'Total flags', es: 'Total flags' },
  'clients.testBot': { en: 'Test Bot', es: 'Probar bot' },
  'clients.viewTestLab': { en: 'Test Lab', es: 'Test Lab' },
  'clients.never': { en: 'Never', es: 'Nunca' },
  'clients.justNow': { en: 'Just now', es: 'Ahora' },
  'clients.delete': { en: 'Delete', es: 'Eliminar' },
  'clients.confirmDelete': { en: 'Are you sure you want to delete this client? This cannot be undone.', es: 'Seguro que quieres eliminar este cliente? No se puede deshacer.' },

  // ─── Feedback Dashboard (admin) ───
  'dashboard.title': { en: 'Feedback Dashboard', es: 'Panel de feedback' },
  'dashboard.subtitle': { en: 'Real-time client annotations across all projects', es: 'Anotaciones de clientes en tiempo real' },
  'dashboard.total': { en: 'Total', es: 'Total' },
  'dashboard.critical': { en: 'Critical', es: 'Crítico' },
  'dashboard.medium': { en: 'Medium', es: 'Medio' },
  'dashboard.minor': { en: 'Minor', es: 'Menor' },
  'dashboard.filterAll': { en: 'All', es: 'Todos' },
  'dashboard.none': { en: 'No Annotations Yet', es: 'Aún no hay anotaciones' },
  'dashboard.noneDesc': { en: 'Client feedback will appear here in real-time', es: 'El feedback de los clientes aparecerá aquí en tiempo real' },
  'dashboard.suggestion': { en: 'Suggestion', es: 'Sugerencia' },
  'dashboard.timeJustNow': { en: 'just now', es: 'ahora' },

  // ─── Language toggle ───
  'lang.toggle': { en: 'ES', es: 'EN' },
};

export default translations;
