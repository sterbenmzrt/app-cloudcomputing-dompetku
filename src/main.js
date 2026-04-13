import "./input.css";
import { initApp } from "./js/app.js";
import { initTxListClickDelegation } from "./js/transactions.js";
import * as api from "./js/public-api.js";

Object.assign(window, api);
initTxListClickDelegation();
initApp();
