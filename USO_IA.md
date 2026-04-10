# Uso de IA

Durante el desarrollo del proyecto he usado **GitHub Copilot** y **ChatGPT** como
herramientas de apoyo. La arquitectura, las decisiones técnicas y la mayor parte
del código son míos; la IA me ha servido para acelerar trabajo mecánico y
contrastar dudas puntuales.

## GitHub Copilot

Lo he tenido activo en el editor durante todo el desarrollo. Lo he usado
principalmente para:

- **Autocompletado de boilerplate** repetitivo: imports de Angular, firmas de
  métodos `inject()`, declaraciones de signals, plantillas de `@Component`.
- **Autocompletado clases de Tailwind**: sugerencias de combinaciones cuando estaba maquetando
  cards, botones o estados de focus/hover.
- **Tipos de TypeScript** para interfaces de respuesta de json-server (`Post`,
  `Comment`, `User`, etc.) y los `PostFilters` del servicio.
- **Estructura de tests** unitarios cuando empecé con Vitest. Me generó el
  esqueleto típico de `describe / beforeEach / it` y luego escribí las
  assertions reales según lo que quería verificar.

## ChatGPT

Lo he usado puntualmente. Casos concretos:

- **Confirmar APIs experimentales de Angular 21**: `httpResource`,
  `provideZonelessChangeDetection`, Signal Forms.
- **Comparar opciones**: cuando dudaba entre usar un `RouteReuseStrategy`
  custom o un `UrlMatcher` para el problema del cambio deidioma sin recrear
  el componente, le pedí los tradeoffs de cada uno. La decisión final la tomé
  yo después de mirar cómo se comportaba cada opción en local. Opté por
  `RouteReuseStrategy` ya que era la forma de no duplicar peticiones al
  cambiar de idioma
- **Traducciones**: claves del JSON de i18n, especialmente las versiones en
  inglés. Le pasaba la clave en español y me devolvía la traducción. Las
  revisé todas para que sonaran naturales.

## Resumen

La IA me ha ahorrado tiempo en lo repetitivo (boilerplate, traducciones,
sintaxis exacta de APIs nuevas) y me ha servido como segundo par de ojos en
algunos momentos.
