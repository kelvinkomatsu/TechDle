/**
 * js/main.js
 * ESM entry file; minimal glue that calls the game controller.
 */
import { initGame } from "./modules/controllers.gameController.js";

document.addEventListener("DOMContentLoaded", () => {
  initGame();
});
