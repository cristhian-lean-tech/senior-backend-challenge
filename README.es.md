# Prueba Técnica Senior Backend — Refactorización del Checkout

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/cristhian-lean-tech/senior-backend-challenge)

> 🇬🇧 English: [README.md](./README.md)

**Stack:** Node.js · Express · TypeScript
**Tiempo estimado:** 2–3 horas
**Rol:** Senior Backend Developer

---

## Contexto

Te entregamos un endpoint funcional en Express que procesa una orden de compra. Aunque el
código cumple con los requerimientos actuales, **toda la lógica de negocio y las reglas de
descuento están fuertemente acopladas dentro del controlador principal**. Esto viola los
principios SOLID y dificulta su escalabilidad y mantenimiento.

Toda la aplicación vive en un único archivo: [`src/index.ts`](./src/index.ts).

## Tu misión

Reestructurar la solución aplicando tu experiencia en arquitectura de software (Clean
Architecture, Hexagonal o similar) y buenas prácticas de diseño.

**El comportamiento observable de la API no debe cambiar.** La suite de aceptación es tu
red de seguridad: tiene que quedar verde en cada paso.

## Requerimientos

### 1. Separación de responsabilidades
Extrae la lógica de negocio de la ruta de Express hacia una estructura de carpetas y
clases adecuada (ej. casos de uso, handlers, dominio). La capa HTTP debería limitarse a
traducir entre HTTP y tu capa de aplicación.

### 2. Patrón Strategy
El cálculo de descuentos hoy usa bloques `if/else`. Refactoriza esa sección implementando
el patrón **Strategy**, de forma que agregar un nuevo descuento no obligue a modificar el
código existente.

### 3. Inyección de dependencias
Usa inyección de dependencias **manual** (sin frameworks ni contenedores adicionales) para
conectar el inventario mock, las estrategias de descuento, la lógica de negocio y el
controlador HTTP.

### 4. TypeScript
Aplica tipado estricto y define las interfaces/tipos necesarios para establecer contratos
claros en tu dominio. `npm run typecheck` debe pasar: `strict` ya está activado y `any` no
es un contrato.

## Reglas y restricciones

- **No cambies el contrato HTTP público** (rutas, códigos de estado, forma de las respuestas).
- **No modifiques `tests/acceptance/`.** Sí te animamos a agregar tus propios tests en
  cualquier otro lugar (`src/**/*.spec.ts` se detecta automáticamente).
- El inventario sigue siendo un mock en memoria: nada de base de datos real.
- Sin contenedores de DI (`tsyringe`, `inversify`, …). El cableado manual es parte del ejercicio.
- Podés agregar dependencias de desarrollo (linter, formatter, helpers de test) si las justificás.
- Cualquier archivo dentro de `src/` se puede mover, renombrar o borrar. `npm start` debe
  seguir levantando el servidor HTTP y respetando `process.env.PORT`.

## Cómo empezar

### Gitpod (recomendado)

Hacé clic en el botón **Open in Gitpod** de arriba. Las dependencias se instalan solas y la
API arranca en el puerto `3000`.

### Local

```bash
npm install
npm run dev     # http://localhost:3000
npm test
```

Requiere Node.js 20+.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm start` | Levanta el servidor HTTP (lo usa la suite de aceptación) |
| `npm run dev` | Levanta el servidor en modo watch |
| `npm test` | Corre la suite de aceptación más los tests que agregues |
| `npm run test:watch` | Lo mismo, en modo watch |
| `npm run typecheck` | `tsc --noEmit` con modo estricto |
| `npm run build` | Compila a `dist/` |

## La suite de aceptación

`tests/acceptance/checkout.spec.ts` es **caja negra**: levanta la app con `npm start` y le
habla por HTTP. Nunca importa tus archivos fuente, así que podés reestructurar `src/` como
quieras sin tocar un solo test.

Si un test falla, tu refactor cambió el comportamiento observable. Eso es una regresión, no
una mejora.

## Contrato de la API

Inventario mock (stock): `prod-1: 10`, `prod-2: 5`, `prod-3: 0`.

`POST /api/checkout`

```jsonc
// request
{
  "products": [
    { "id": "prod-1", "price": 100, "requestedQuantity": 2 }
  ],
  "discountCode": "10PERCENT" // opcional
}
```

| Caso | Status | Body |
| --- | --- | --- |
| Orden válida | `200` | `{ "totalToPay": number }` |
| `products` ausente o no es un array | `400` | `{ "error": string }` |
| Cantidad pedida mayor al stock (o producto inexistente) | `400` | `{ "error": "...<id del producto>..." }` |
| Falla inesperada | `500` | `{ "error": string }` |

Códigos de descuento: `10PERCENT` (10% sobre el total) y `MINUS10` (resta 10 al total).
Cualquier otro código se ignora y el total queda igual.

Mirá [`requests.http`](./requests.http) para ejemplos listos para ejecutar.

## Entrega

1. Usá el botón **Use this template** en GitHub (o hacé un fork) para crear tu propia copia.
2. Trabajá en una rama, con commits que cuenten una historia: leemos el historial.
3. Agregá un `DECISIONS.md` en la raíz explicando:
   - qué arquitectura elegiste y **por qué**,
   - qué trade-offs aceptaste y qué dejaste afuera a propósito,
   - cómo agregarías una nueva regla de descuento (ej. `FREESHIPPING`),
   - qué harías después si tuvieras más tiempo.
4. Abrí un pull request contra este repositorio, o compartinos el link a tu fork.

## Cómo evaluamos

| Área | Qué miramos |
| --- | --- |
| Arquitectura | Capas claras, dependencias apuntando hacia adentro, dominio sin Express |
| Patrón Strategy | Open/Closed: un descuento nuevo es un archivo nuevo, no un `if` editado |
| Inyección de dependencias | Composition root explícito, dependencias invertidas vía interfaces |
| TypeScript | Contratos precisos, sin `any` como escape, bordes validados |
| Testing | Tests unitarios con sentido en dominio y estrategias, aceptación en verde |
| Comunicación | Historial de commits y `DECISIONS.md` que expliquen el razonamiento |

Sobre-ingeniería no suma. Preferimos un diseño chico y coherente que puedas defender antes
que una pila de patrones aplicados por reflejo.

¡Éxitos! 🚀
