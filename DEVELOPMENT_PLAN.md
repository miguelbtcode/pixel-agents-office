# Plan de Implementación — Pixel Agents Office

> Plataforma de agentes IA multidisciplinarios visualizada como oficina pixel-art (estilo Gather)

---

## Fase 0 — Scaffolding & Configuración Base

**Objetivo:** Tener el proyecto corriendo con la estructura base lista para desarrollar.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 0.1 | Inicializar proyecto Next.js 14 | `create-next-app` con App Router, TypeScript, Tailwind CSS, ESLint | Crítica |
| 0.2 | Configurar pnpm workspace | `pnpm-lock.yaml`, scripts en `package.json` (`dev`, `build`, `lint`) | Crítica |
| 0.3 | Instalar dependencias core | `zustand`, `pixi.js` (o canvas puro), `tailwind-merge`, `clsx` | Crítica |
| 0.4 | Crear estructura de carpetas | Según `CLAUDE.md`: `src/engine/`, `src/store/`, `src/simulation/`, `src/data/`, `src/types/` | Crítica |
| 0.5 | Configurar Tailwind + globals.css | Pixel-art font (`Press Start 2P`), variables CSS, reset base | Alta |
| 0.6 | Layout base responsive | `layout.tsx` con sidebar colapsable + área principal del canvas | Alta |

**Entregable:** Proyecto corriendo en `localhost:3000` con layout vacío responsive.

---

## Fase 1 — Sistema de Tipos & Datos Estáticos

**Objetivo:** Definir todos los tipos TypeScript y datos iniciales que alimentan el sistema.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 1.1 | Definir `types/agent.ts` | `Agent`, `AgentRole`, `AgentState` (idle, walking, talking, meeting, break), `AgentAppearance` (hair, outfit, accessories), `AgentPosition` | Crítica |
| 1.2 | Definir `types/office.ts` | `Tile`, `TileType` (floor, wall, furniture, door), `Room`, `RoomType`, `FurnitureItem`, `OfficeTheme` | Crítica |
| 1.3 | Definir `types/activity.ts` | `ActivityEntry`, `ActivityType` (message, code_commit, review, bug_found, deployment, meeting, break), filtros | Crítica |
| 1.4 | Definir `types/editor.ts` | `EditorMode`, `DragState`, `PlacementPreview`, `AccessoryItem` | Alta |
| 1.5 | Crear `data/agentProfiles.ts` | 5 agentes con nombre, rol, color primario, posición inicial, apariencia default | Crítica |
| 1.6 | Crear `data/mapLayout.ts` | Grid 2D de tiles (40x30 mínimo) con rooms definidos: workspace, meeting room, kitchen, server room | Crítica |
| 1.7 | Crear `data/furnitureCatalog.ts` | Catálogo de muebles: escritorios, sillas, pizarras, plantas, máquinas expendedoras, cafetera | Alta |
| 1.8 | Crear `data/accessoryCatalog.ts` | Accesorios para agentes: lentes, gorros, audífonos, corbatas, badges | Alta |

**Entregable:** Todos los tipos y datos listos para consumir.

---

## Fase 2 — Motor de Renderizado (Engine)

**Objetivo:** Canvas funcional que renderiza el mapa tile-based con cámara controlable.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 2.1 | Implementar `engine/TileMap.ts` | Clase que carga el grid, identifica tiles walkables, expone métodos para consultar tiles por coordenada | Crítica |
| 2.2 | Implementar `engine/Renderer.ts` | Dibuja tiles, muebles y agentes en el canvas. Soporte para layers (floor → furniture → agents → UI) | Crítica |
| 2.3 | Implementar `engine/GameLoop.ts` | `requestAnimationFrame` loop con delta time. Métodos `update(dt)` y `render()`. Start/stop/pause | Crítica |
| 2.4 | Implementar `engine/SpriteSheet.ts` | Carga sprite sheets, extrae frames por coordenada, soporta animaciones con frame rate configurable | Crítica |
| 2.5 | Implementar `engine/Pathfinder.ts` | Algoritmo A* sobre el grid de tiles walkables. Input: origen/destino → Output: array de posiciones | Crítica |
| 2.6 | Crear `OfficeCanvas.tsx` | Componente React con `<canvas>` + `useRef`. Inicializa el GameLoop y Renderer. Escucha resize para responsive | Crítica |
| 2.7 | Implementar Camera system | Pan (drag/touch), zoom (scroll/pinch), límites del mapa, smooth lerp transitions | Alta |
| 2.8 | Generar pixel-art sprites programáticos | Funciones que dibujan agentes, muebles y tiles directamente en canvas (sin assets externos) para MVP | Alta |

**Entregable:** Canvas que muestra el mapa completo de la oficina con cámara navegable.

---

## Fase 3 — Agentes & Movimiento

**Objetivo:** Los 5 agentes aparecen en el mapa, se mueven y tienen animaciones básicas.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 3.1 | Crear `store/useAgentStore.ts` | Zustand store: posiciones, estados, paths activos, apariencia de cada agente | Crítica |
| 3.2 | Renderizar agentes en canvas | Dibujar cada agente en su posición con sprite según dirección (up/down/left/right) | Crítica |
| 3.3 | Animación idle | Sprite de idle con 2-4 frames de animación sutil (respiración, parpadeo) | Alta |
| 3.4 | Animación walk | Movimiento suave entre tiles (interpolación), sprite animado de caminar en 4 direcciones | Crítica |
| 3.5 | Integrar pathfinding | Cuando un agente necesita moverse, calcular ruta A* y ejecutar movimiento tile-a-tile | Crítica |
| 3.6 | State machine del agente | Estados: `idle` → `walking` → `talking` → `meeting` → `break`. Transiciones limpias | Crítica |
| 3.7 | Nombre flotante | Renderizar nombre del agente + rol sobre su sprite | Media |
| 3.8 | Click en agente | Detectar click/tap en un agente para mostrar su info | Alta |

**Entregable:** 5 agentes visibles en la oficina con movimiento animado y pathfinding funcional.

---

## Fase 4 — Sistema de Interacciones

**Objetivo:** Los agentes se comunican entre sí con movimiento físico, burbujas de texto y logs.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 4.1 | Crear `simulation/InteractionManager.ts` | Gestiona la cola de interacciones, coordina movimiento del sender hacia el receiver | Crítica |
| 4.2 | Crear `simulation/scenarios.ts` | Escenarios predefinidos: code review (Luna→Max), bug report (Sam→Ava), deploy request (Rio→Luna), standup (todos→meeting room) | Crítica |
| 4.3 | Crear `simulation/Scheduler.ts` | Programa interacciones en intervalos pseudo-aleatorios. Simula una jornada laboral con ritmo natural | Crítica |
| 4.4 | Implementar `AgentBubble.tsx` | Burbuja de texto pixel-art sobre el agente hablando. Aparece con animación, desaparece tras N segundos | Alta |
| 4.5 | Animación de conversación | Cuando dos agentes hablan: se miran, burbuja alternada, animación "talking" | Alta |
| 4.6 | Reuniones grupales | Trigger para que todos los agentes caminen al meeting room y se sienten. Burbujas secuenciales | Alta |
| 4.7 | Interacciones contextuales | Diferentes mensajes según tipo: review comments, bug descriptions, deploy status, architecture proposals | Media |
| 4.8 | Crear `simulation/AgentBehavior.ts` | Lógica de decisión: cuándo ir a tomar café, cuándo pedir review, cuándo reportar bug. Probabilístico | Alta |

**Entregable:** Agentes interactúan autónomamente — caminan, hablan, se reúnen, toman breaks.

---

## Fase 5 — Activity Log Panel

**Objetivo:** Panel lateral con logs en tiempo real de toda la actividad de los agentes.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 5.1 | Crear `store/useActivityStore.ts` | Zustand store: array de entries, métodos para agregar, filtrar, limpiar | Crítica |
| 5.2 | Implementar `ActivityLog.tsx` | Panel scrollable con auto-scroll al último entry. Sticky header con título y controles | Crítica |
| 5.3 | Implementar `ActivityEntry.tsx` | Componente individual: ícono por tipo, timestamp, nombre del agente (color-coded), descripción, agentes relacionados | Crítica |
| 5.4 | Implementar `ActivityFilter.tsx` | Filtros: por agente (checkbox por cada uno), por tipo de actividad, por room | Alta |
| 5.5 | Conectar interacciones → log | Cada interacción del `InteractionManager` genera automáticamente una entry en el log | Crítica |
| 5.6 | Indicadores visuales | Badges de nuevo, highlight de entries recientes, agrupación por timestamp | Media |
| 5.7 | Panel responsive | En desktop: sidebar derecho. En mobile: bottom sheet deslizable. En tablet: sidebar colapsable | Alta |
| 5.8 | Búsqueda en log | Input de búsqueda para filtrar entries por texto | Baja |

**Entregable:** Panel de actividad funcional sincronizado en tiempo real con las acciones de los agentes.

---

## Fase 6 — Stores Zustand & Estado Global

**Objetivo:** Todo el estado de la aplicación centralizado y reactivo.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 6.1 | Crear `store/useOfficeStore.ts` | Estado de muebles, rooms, tema activo, modo editor on/off | Crítica |
| 6.2 | Persistencia local | Guardar estado del office y apariencia de agentes en `localStorage` | Alta |
| 6.3 | Sincronizar stores con engine | El GameLoop lee del store para renderizar. Los stores se actualizan desde la simulación | Crítica |
| 6.4 | Acciones de office | `addFurniture()`, `removeFurniture()`, `moveFurniture()`, `setTheme()` | Alta |
| 6.5 | Acciones de agente | `updateAppearance()`, `setPosition()`, `changeState()` | Alta |
| 6.6 | DevTools | Integrar Zustand devtools para debugging en desarrollo | Baja |

**Entregable:** Estado global robusto que conecta UI, simulación y engine.

---

## Fase 7 — Editor de Oficina

**Objetivo:** El usuario puede personalizar la oficina arrastrando muebles y cambiando el tema.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 7.1 | Implementar `FurniturePanel.tsx` | Panel lateral/inferior con catálogo de muebles disponibles, agrupados por categoría | Alta |
| 7.2 | Drag & drop de muebles | Arrastrar mueble del panel al canvas, preview translúcido, snap-to-grid al soltar | Alta |
| 7.3 | Selección de muebles en canvas | Click en mueble → borde resaltado, opciones de mover/rotar/eliminar | Alta |
| 7.4 | Implementar `DragHandle.tsx` | Componente reutilizable para drag-and-drop con soporte touch | Alta |
| 7.5 | Implementar `ThemeSelector.tsx` | 3-4 temas preset: Modern (colores claros), Retro (tonos sepia), Dark Mode, Neon | Media |
| 7.6 | Validación de placement | No permitir colocar muebles sobre walls, otros muebles o tiles no-walkables ocupados | Alta |
| 7.7 | Undo/Redo | Stack de acciones para deshacer/rehacer cambios en el editor | Media |
| 7.8 | Toggle modo editor | Botón que activa/desactiva el modo editor. En modo editor se pausa la simulación | Alta |

**Entregable:** Editor funcional para reorganizar la oficina con drag-and-drop.

---

## Fase 8 — Editor de Apariencia de Agentes

**Objetivo:** Personalizar la apariencia de cada agente (ropa, pelo, accesorios).

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 8.1 | Implementar `AgentEditor.tsx` | Modal con preview en tiempo real del agente mientras se edita | Alta |
| 8.2 | Selector de color de pelo | Paleta de 8-12 colores pixel-art para cabello | Alta |
| 8.3 | Selector de color de outfit | Paleta para camisa/camiseta del agente | Alta |
| 8.4 | Selector de accesorios | Grid de accesorios disponibles: lentes, gorros, audífonos, bufandas, etc. Toggle on/off | Alta |
| 8.5 | Preview animado | Mostrar el agente con animación idle en el editor para ver cómo se ve en movimiento | Media |
| 8.6 | Guardar y aplicar | Al confirmar, actualizar el store y re-renderizar el agente en el canvas inmediatamente | Alta |
| 8.7 | Reset a defaults | Botón para restaurar apariencia original del agente | Baja |
| 8.8 | Implementar `AgentCard.tsx` | Tarjeta en sidebar: avatar, nombre, rol, estado actual, botón "Editar apariencia" | Alta |

**Entregable:** Sistema completo de personalización visual de agentes.

---

## Fase 9 — UI Components & Polish

**Objetivo:** Componentes UI reutilizables y pulido visual general.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 9.1 | Implementar `ui/Button.tsx` | Botón pixel-art con variantes: primary, secondary, ghost, danger. Tamaños: sm, md, lg | Alta |
| 9.2 | Implementar `ui/Modal.tsx` | Modal con overlay, animación de entrada/salida, close en Escape y click outside | Alta |
| 9.3 | Implementar `ui/Panel.tsx` | Panel con header, contenido scrollable, borde pixel-art, colapsable | Alta |
| 9.4 | Implementar `ui/Tooltip.tsx` | Tooltip con posicionamiento automático y estilo pixel | Media |
| 9.5 | Implementar `MiniMap.tsx` | Mini-mapa en esquina mostrando vista completa de la oficina con posiciones de agentes como dots | Alta |
| 9.6 | Animaciones ambientales | Plantas moviéndose, vapor del café, parpadeo de pantallas en los escritorios | Media |
| 9.7 | Sonido (opcional) | Efectos sutiles: pasos, notificación de mensaje, ambiente de oficina | Baja |
| 9.8 | Loading screen | Pantalla de carga pixel-art mientras se inicializan sprites y mapa | Media |

**Entregable:** UI pulida con componentes consistentes y detalles ambientales.

---

## Fase 10 — Responsive & Mobile

**Objetivo:** Experiencia completa y usable en todos los tamaños de pantalla.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 10.1 | Canvas responsive | Escalar el canvas dinámicamente al tamaño del viewport. Recalcular en resize | Crítica |
| 10.2 | Layout mobile | Canvas full-width, activity log como bottom sheet, controles de agente como drawer | Crítica |
| 10.3 | Layout tablet | Sidebar colapsable, canvas con más espacio | Alta |
| 10.4 | Layout desktop | Sidebar izquierdo (agentes) + canvas central + sidebar derecho (activity log) | Alta |
| 10.5 | Touch controls | Pinch-to-zoom, pan con un dedo, tap para seleccionar agente, long-press para opciones | Crítica |
| 10.6 | Editor mobile | Panel de muebles como bottom drawer, drag-and-drop adaptado a touch | Alta |
| 10.7 | Performance mobile | Reducir partículas, simplificar animaciones, throttle de renders en dispositivos lentos | Alta |
| 10.8 | Breakpoints Tailwind | `sm:`, `md:`, `lg:`, `xl:` para todos los componentes UI | Alta |

**Entregable:** App 100% funcional y usable en mobile, tablet y desktop.

---

## Fase 11 — Testing & QA

**Objetivo:** Cobertura de tests en lógica crítica y estabilidad general.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 11.1 | Unit tests — Pathfinder | Verificar A* con mapas de prueba, obstáculos, sin ruta posible | Alta |
| 11.2 | Unit tests — TileMap | Verificar carga de mapa, queries de tiles, walkability | Alta |
| 11.3 | Unit tests — Stores | Verificar acciones de Zustand: agregar/remover muebles, cambiar apariencia, filtrar logs | Alta |
| 11.4 | Unit tests — Scheduler | Verificar que genera eventos en intervalos correctos | Media |
| 11.5 | Unit tests — InteractionManager | Verificar cola de interacciones, movimiento coordinado | Media |
| 11.6 | Integration tests — Simulación | Verificar flujo completo: scheduler → interaction → movement → log entry | Alta |
| 11.7 | Visual regression | Screenshots comparativos del canvas en diferentes estados | Baja |
| 11.8 | Cross-browser testing | Chrome, Firefox, Safari, Edge — verificar canvas y touch | Media |

**Entregable:** Suite de tests con cobertura en lógica core.

---

## Fase 12 — Build, Optimización & Deploy

**Objetivo:** Build de producción optimizado y deployment.

| # | Tarea | Detalle | Prioridad |
|---|-------|---------|-----------|
| 12.1 | Optimizar bundle | Tree-shaking, code splitting, lazy load del editor | Alta |
| 12.2 | Optimizar canvas | Object pooling para sprites, off-screen canvas buffering, frame skip en background tabs | Alta |
| 12.3 | Image optimization | Comprimir sprite sheets, usar formatos eficientes (WebP con fallback PNG) | Media |
| 12.4 | Lighthouse audit | Target: Performance >90, Accessibility >85, Best Practices >95 | Alta |
| 12.5 | SEO & meta tags | Open Graph tags, favicon pixel-art, título y descripción | Media |
| 12.6 | Deploy a Vercel | Configurar proyecto en Vercel, variables de entorno si aplica | Alta |
| 12.7 | CI pipeline | GitHub Actions: lint + build + test en cada PR | Media |
| 12.8 | Documentación README | README.md con screenshots, instrucciones de setup, demo link | Media |

**Entregable:** App deployada en producción, optimizada y documentada.

---

## Resumen de Fases

| Fase | Nombre | Features | Prioridad |
|------|--------|----------|-----------|
| 0 | Scaffolding & Config | 6 | Crítica |
| 1 | Tipos & Datos | 8 | Crítica |
| 2 | Motor de Renderizado | 8 | Crítica |
| 3 | Agentes & Movimiento | 8 | Crítica |
| 4 | Sistema de Interacciones | 8 | Crítica |
| 5 | Activity Log Panel | 8 | Crítica |
| 6 | Stores & Estado Global | 6 | Crítica |
| 7 | Editor de Oficina | 8 | Alta |
| 8 | Editor de Agentes | 8 | Alta |
| 9 | UI & Polish | 8 | Alta |
| 10 | Responsive & Mobile | 8 | Crítica |
| 11 | Testing & QA | 8 | Alta |
| 12 | Build & Deploy | 8 | Alta |
| **Total** | | **100 features** | |

---

## Orden de Ejecución Recomendado

```
Fase 0 → Fase 1 → Fase 2 → Fase 6 (parcial) → Fase 3 → Fase 4 → Fase 5
    → Fase 9 → Fase 7 → Fase 8 → Fase 10 → Fase 11 → Fase 12
```

> **Nota:** Las fases 6 (stores) se desarrolla incrementalmente junto con las fases 2-5.
> Las fases 7 y 8 (editores) pueden desarrollarse en paralelo.
> La fase 10 (responsive) se aplica continuamente pero se refina al final.
