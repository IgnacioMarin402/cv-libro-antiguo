// The CV itself, as data: everything the book prints and, later, the plain
// HTML version (with its PDF) is built from. One place to edit when the CV
// changes.
//
// Contact is LinkedIn and GitHub only, on purpose: the site is public, and
// a phone number or an e-mail in it would be read by every scraper.

export const PERSON = {
  name: 'Ignacio Marín Soto',
  role: 'Desarrollador FullStack Senior',
  org: 'Correos de Chile',
  place: 'Chile · Remoto',
  links: [
    { label: 'LinkedIn', text: 'linkedin.com/in/ignacio-marín-soto' },
    { label: 'GitHub', text: 'github.com/IgnacioMarin402' },
  ],
}

// In his own words, a note to whoever opens the book.
export const INTRO = [
  'Mi nombre es Ignacio, y esto fue hecho con mucho cariño y paciencia. Quise mostrar una experiencia de presentación distinta.',
  'Elegí cuidadosamente las cosas que ves acá, porque les tengo mucho aprecio. Me gustan las cosas fantasiosas, y creo que combinarlas con lo que aprecio es otra forma de darme a conocer.',
  '¡Espero que sea de tu agrado!',
]

export const PROFILE =
  'Desarrollador fullstack con 6 años de experiencia, enfocado en NestJS, TypeScript y arquitecturas limpias. Hoy soy FullStack Senior en Correos de Chile, y llevo tres años en su ecosistema a través de distintos proyectos, lo que me dio dominio del negocio logístico y sus integraciones. Trabajo con Spec-Driven Development e integro herramientas de IA en el flujo de desarrollo, no como atajo, sino para sostener consistencia arquitectónica mientras acelero entregas.'

export const STACK = [
  { label: 'Backend', text: 'NestJS · Node.js · TypeScript · TypeORM · Laravel · PHP · APIs REST · SOAP' },
  { label: 'Frontend', text: 'React · Next.js · Zustand · JavaScript' },
  { label: 'Datos', text: 'PostgreSQL · MySQL · Strapi CMS · Migraciones · Modelado de datos' },
  {
    label: 'Arquitectura',
    text: 'Hexagonal (Ports & Adapters) · Clean Architecture · Microservicios · Patrón Outbox · Circuit Breaker · Clean Code',
  },
  { label: 'Prácticas', text: 'Spec-Driven Development · Testing con Jest · Code Reviews · Git Flow · Conventional Commits' },
  { label: 'Infra y obs.', text: 'Docker · GitHub Actions · Loki · Grafana · Winston' },
  { label: 'IA', text: 'Claude Code · GitHub Copilot · Cursor' },
]

// Newest first. `note` is the one line of context under the role; `stack`
// closes the entry.
export const EXPERIENCE = [
  {
    role: 'Desarrollador FullStack Senior',
    org: 'Correos de Chile',
    dates: 'sept. 2026 – actualidad',
    bullets: [
      'Reemplazo al tech lead del equipo durante sus vacaciones.',
      'Tomo decisiones técnicas sobre cómo nos integraremos con servicios externos como IPS.',
      'Desarrollé un motor que genera códigos UPU.',
    ],
  },
  {
    role: 'Analista Senior',
    org: 'Consultora Cima',
    dates: 'oct. 2025 – sept. 2026',
    place: 'Remoto',
    note: 'Backend en Conecta Logístico, plataforma de gestión logística de Correos de Chile.',
    bullets: [
      'Impulsé el proyecto base del equipo con NestJS y arquitectura hexagonal (ports & adapters), estableciendo la estructura sobre la que trabajan 18 desarrolladores y equipos externos.',
      'Implementé la notificación de eventos de envío bajo patrón Outbox, desacoplando la generación de eventos de su despacho mediante una cola por polling y garantizando la entrega sin acoplar procesos.',
      'Diseñé una abstracción reutilizable de jobs programados (clase base + inyección de contexto): cada nuevo job hereda manejo de reintentos, lotes y bloqueo por concurrencia, eliminando duplicación entre procesos.',
      'Diseñé la gestión y trazabilidad de movimientos de envíos: modelado de datos, máquina de estados y migraciones con TypeORM.',
      'Definí e implementé integraciones HTTP entre varios microservicios y Conecta Logístico (CLOG), analizando los puntos de conexión adecuados dentro de una arquitectura que ya incluía mensajería asíncrona (RabbitMQ) de otros equipos.',
      'Implementé un circuit breaker genérico (opossum) para llamadas a servicios externos dentro del monorepo de microservicios, aplicando estrategias fail-fast en los flujos críticos para evitar que el backend quedara bloqueado esperando una respuesta que no llegaría.',
      'Lideré decisiones técnicas de clean code y estándares del equipo, con code reviews como apoyo transversal.',
      'Apliqué Spec-Driven Development e integré herramientas de IA (Claude Code, Copilot, Cursor) al flujo de trabajo.',
    ],
    stack: 'NestJS · TypeScript · TypeORM · PostgreSQL · Docker · Arquitectura Hexagonal · Patrón Outbox · Integraciones HTTP · Circuit Breaker (opossum)',
  },
  {
    role: 'Desarrollador de TI',
    org: 'CorreosChile',
    dates: 'dic. 2024 – oct. 2025',
    place: 'Remoto',
    note: 'Full stack en Portal Empresa, plataforma de autoatención para clientes empresariales.',
    bullets: [
      'Desarrollé funcionalidades end-to-end aplicando Clean Architecture en backend y React con Zustand para gestión de estado en frontend.',
      'Integré Strapi CMS como capa de persistencia y administración de contenidos.',
      'Configuré observabilidad con Winston y Loki para trazabilidad de logs entre ambientes.',
      'Trabajé bajo Git Flow con releases por rama.',
    ],
    stack: 'Node.js · React · Zustand · Strapi CMS · Clean Architecture · Winston · Loki',
  },
  {
    role: 'Analista Programador',
    org: 'Anticipa S.A.',
    dates: 'feb. 2024 – nov. 2024',
    place: 'Remoto',
    note: 'Backend en Conecta POS, plataforma de puntos de venta de Correos de Chile.',
    bullets: [
      'Diseñé y desarrollé APIs REST con NestJS bajo arquitectura hexagonal, separando dominio, aplicación e infraestructura.',
      'Desarrollé un microservicio de auditoría para trazar las requests hacia procesos SAP.',
      'Integré servicios externos vía SOAP y REST, incluyendo sistemas legacy.',
      'Implementé observabilidad con Loki y Grafana, y pruebas unitarias con Jest alcanzando 85% de cobertura.',
    ],
    stack: 'NestJS · TypeScript · PostgreSQL · Jest · SOAP · Loki · Grafana · Microservicios',
  },
  {
    role: 'Ingeniero de Soporte Senior',
    org: 'Holdco Networks',
    dates: 'dic. 2023 – feb. 2024',
    place: 'Remoto',
    note: 'Desarrollo y mantención de aplicaciones internas para optimización de procesos operativos.',
    bullets: [
      'Desarrollé aplicaciones full stack con React.js y Laravel, desde diseño hasta despliegue.',
      'Implementé un sistema IVR para automatizar la atención de llamados.',
      'Refactoricé y corregí código heredado en múltiples proyectos del área.',
    ],
    stack: 'React.js · Laravel · PHP · Bases de datos · IVR',
  },
  {
    role: 'Ingeniero de Soporte (Inicial → Senior)',
    org: 'Mundo Pacífico',
    dates: 'sept. 2022 – nov. 2023',
    note: 'Área de I+D+i. Ascenso a nivel senior tras un año en el rol.',
    bullets: [
      'Automaticé la eliminación masiva de registros del CRM y otras tareas recurrentes mediante scripts y Crontab, procesando hasta cientos de miles de registros por ejecución.',
      'Investigué y refactoricé código del CRM (acceso a clientes, reclamos), proponiendo mejoras al flujo del equipo de soporte.',
      'Diagnostiqué y resolví incidencias en bases de datos y sistemas productivos, y documenté 7 procedimientos recurrentes que redujeron el tiempo de resolución.',
    ],
    stack: 'JavaScript · Crontab · SQL · CRM',
  },
  {
    role: 'Programador Junior',
    org: 'Muss SPA',
    dates: 'oct. 2020 – jun. 2021',
    note: 'Desarrollo de aplicación web para el holding ASIVA (sitio público, intranet y reportes). Inicio como practicante.',
    bullets: [
      'Implementé módulos con Laravel, Inertia.js y Vue.js bajo arquitectura MVC, incluyendo un editor de texto para el sitio público.',
      'Diseñé y consumí endpoints con MySQL como capa de datos; trabajé con ORM y migraciones.',
    ],
    stack: 'Laravel · Inertia.js · Vue.js · MySQL · PHP',
  },
  {
    role: 'Desarrollador Web',
    org: 'Betech LTDA',
    dates: 'dic. 2019 – mar. 2020',
    note: 'Construí de extremo a extremo una aplicación web de monitoreo y medición hidráulica de estanques (PHP, JavaScript, jQuery, MySQL), desde el levantamiento de requerimientos hasta la puesta en marcha, reemplazando el registro en papel por monitoreo autónomo.',
  },
  {
    role: 'Práctica Profesional',
    org: 'ARAUCO',
    dates: 'ene. 2019 – mar. 2019',
    note: 'Automaticé 3 reportes operacionales en Excel con macros y VBA, reduciendo su elaboración de 8 horas a 10 minutos en promedio.',
  },
  {
    role: 'Ayudante de Cátedra',
    org: 'Duoc UC',
    dates: 'ago. 2017 – dic. 2017',
    note: 'Apoyo académico en Programación Orientada a Objetos II (Java): resolución de ejercicios con estudiantes y revisión de código junto al docente.',
  },
]

export const PROJECTS = [
  {
    name: 'Spec-Flow Plugin',
    link: 'github.com/IgnacioMarin402/spec-flow-plugin',
    bullets: [
      'Plugin para Claude Code: motor de pipeline multi-agente para Spec-Driven Development donde una feature se da por completada solo cuando un test que efectivamente se ejecutó demuestra cada requerimiento de su spec; lint, tests y trazabilidad de requerimientos corren fuera del modelo (comandos /spec-flow y /spec-fix).',
      'Incorpora principios de Requirement-Driven Development (RDD), harness engineering y loop engineering; extraído y generalizado desde mi proyecto api-nestjs-with-spec-driven-development, para proyectos Node.',
    ],
  },
  {
    name: 'API NestJS con Spec-Driven Development',
    link: 'github.com/IgnacioMarin402/api-nestjs-with-spec-driven-development',
    bullets: [
      'Proyecto backend donde aplico y documento un flujo de desarrollo dirigido por especificaciones, con specs versionadas junto al código para asegurar trazabilidad entre diseño e implementación.',
      'Pipeline de calidad con GitHub Actions, commitlint (Conventional Commits), lefthook, ESLint y Prettier; arquitectura hexagonal sobre NestJS con pnpm workspaces.',
    ],
  },
]

export const MENTORING = {
  title: 'Mentoría técnica a desarrolladores junior',
  note: 'Iniciativa personal · Sesiones semanales (miércoles)',
  text: 'Enseño arquitectura hexagonal (ports & adapters) y NestJS a desarrolladores junior, desde fundamentos hasta implementación práctica, con ejercicios guiados y revisión de código.',
}

export const EDUCATION = [
  { title: 'Diplomado en Arquitectura de Software', place: 'Universidad Autónoma de Chile', dates: '2025' },
  { title: 'Ingeniero en Informática', place: 'Duoc UC', dates: '2016 – 2019' },
]

export const LANGUAGES = [
  { label: 'Español', text: 'Nativo' },
  { label: 'Inglés', text: 'B2' },
]

export const CERTIFICATIONS = [
  'MTA 98-361 — Software Development Fundamentals (C#), Microsoft',
  'Arquitecturas Limpias para Desarrollo de Software — Platzi, 2025',
  'Claude Code 101 — Anthropic, 2026',
  'Claude 101 — Anthropic, 2026',
]
