/**
 * Port used by the acceptance suite. The suite boots the app through
 * `npm start`, so it never imports your source code: you are free to move,
 * rename and restructure every file inside `src/`.
 */
export const ACCEPTANCE_PORT = 4010;
export const BASE_URL = `http://127.0.0.1:${ACCEPTANCE_PORT}`;
