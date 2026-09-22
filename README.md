# AORAA Task

> Tú dilo, AORAA lo acomoda.

AORAA Task es un **prototipo de alta fidelidad** de una app web de gestión inteligente de tareas. Escribes o dictas lo que tienes que hacer con tus palabras y la app lo interpreta, le busca un hueco real en tu semana y te avisa cuando un día ya no te cabe.

> **Prototipo sin backend.** Todo corre en el navegador con datos simulados. No hay servidor, cuentas reales ni llamadas a servicios de IA: el intérprete de lenguaje natural y el motor de agendado son deterministas y viven en `src/lib/`. El estado se guarda en `localStorage`.

## Qué hace

- **Captura en lenguaje natural.** Una frase como *"Mañana tengo que entregar el reporte de Cálculo, el viernes voy al dentista a las cinco y necesito estudiar para el examen del martes"* se convierte en tres tareas con día, hora, duración, categoría y prioridad.
- **Dictado simulado.** El modo de voz reproduce la frase de demostración palabra por palabra; no usa el micrófono.
- **Agendado automático.** Un motor voraz coloca cada tarea en el primer hueco libre antes de su fecha límite, respetando tu horario, tus bloques fijos y una holgura entre tareas. Cada decisión trae su explicación.
- **Anillo de carga.** Cada día muestra qué porcentaje de tu tiempo disponible ya está ocupado. Arriba de 100% el anillo cambia a ámbar.
- **Sugerencias de sobrecarga.** Si un día se pasa, la app propone tres arreglos con tus tareas reales: mover, recortar o eliminar.
- **Vista semanal con arrastre.** Arrastra bloques a otro día u hora; los bloques fijos no se mueven.
- **Conexiones simuladas** con Google Calendar, Apple Calendar y Notion.
- **Paleta de comandos** (`⌘K` / `Ctrl+K`) y atajos: `N` nueva tarea, `T` hoy, `W` semana.

La interfaz está en español de México y solo tiene tema oscuro.

## Cómo correrlo

Requisitos: Node.js 18 o superior.

```bash
npm install && npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

| Comando           | Qué hace                                        |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente  |
| `npm run build`   | Revisa los tipos y genera la versión en `dist/` |
| `npm run preview` | Sirve localmente la versión compilada           |
| `npm run lint`    | Revisión de tipos con TypeScript                |

Para volver a los datos de ejemplo: **Perfil → Reiniciar datos**, o borra la clave `aoraa-task` de `localStorage`.

## Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/)
- TypeScript en modo estricto (sin `any`)
- [Tailwind CSS 3](https://tailwindcss.com/) con tokens de diseño en `tailwind.config.js`
- [React Router 6](https://reactrouter.com/)
- [Zustand](https://zustand-demo.pmnd.rs/) persistido en `localStorage`
- [Framer Motion](https://www.framer.com/motion/) para animaciones (respeta `prefers-reduced-motion`)
- [date-fns](https://date-fns.org/) con locale `es`
- [lucide-react](https://lucide.dev/) para íconos

### Sistema de diseño

Ningún componente escribe colores hexadecimales. Todos salen de los tokens definidos en `tailwind.config.js`:

`ink` · `surface` · `elevated` · `line` · `text` · `muted` · `accent` · `accentDim` · `warn` · `warnDim` · `danger`

La tipografía es Inter en dos pesos (400 y 500), con cinco tamaños: `title`, `subtitle`, `body`, `aux` y `micro`.

## Estructura

```
src/
├── App.tsx                 Rutas de la app
├── main.tsx                Punto de entrada
├── index.css               Estilos base de Tailwind
├── components/
│   ├── brand/              Logo, ícono y anillo de carga
│   ├── calendar/           Cuadrícula semanal con arrastre
│   ├── capture/            Hoja de captura por texto y voz
│   ├── layout/             Estructura, navegación y paleta de comandos
│   ├── task/               Tarjeta, lista, detalle y editor de tareas
│   └── ui/                 Componentes base: botón, campo, modal, aviso…
├── integrations/           Glifos de calendarios y apps conectables
├── lib/
│   ├── parser.ts           Intérprete de lenguaje natural
│   ├── scheduler.ts        Motor de agendado voraz
│   ├── capacity.ts         Carga diaria y sugerencias de sobrecarga
│   ├── fakeAI.ts           Simula los tiempos y estados de una IA
│   ├── seed.ts             28 tareas de ejemplo
│   ├── dates.ts            Utilidades de fechas en español
│   └── types.ts            Tipos del dominio
├── screens/                Una pantalla por ruta
└── store/
    ├── useAppStore.ts      Estado persistido: tareas, horario, conexiones
    └── useUIStore.ts       Estado de interfaz: captura y paleta
```

### Rutas

| Ruta                  | Pantalla                                   |
| --------------------- | ------------------------------------------ |
| `/bienvenida`         | Introducción en tres pasos                 |
| `/entrar`             | Acceso simulado                            |
| `/configurar-horario` | Días, rango de horas y bloques fijos       |
| `/hoy`                | Día en curso con su anillo de carga        |
| `/capturar`           | Abre la hoja de captura sobre Hoy          |
| `/semana`             | Cuadrícula semanal con arrastre            |
| `/sobrecarga?dia=`    | Carga de un día y sugerencias para aliviarlo |
| `/pendientes`         | Tareas sin agendar y vencidas              |
| `/tarea/:id`          | Detalle y edición de una tarea             |
| `/conexiones`         | Calendarios y apps                         |
| `/planes`             | Planes Gratis y Pro                        |
| `/perfil`             | Cuenta, preferencias y reinicio de la demo |

## Estado del proyecto

Las fases 1 a 8 están completas: andamiaje, tokens, componentes base, estado, motor, rutas y pantallas.

Falta la fase 9: pulido, repaso de accesibilidad y verificación de los criterios de aceptación.
