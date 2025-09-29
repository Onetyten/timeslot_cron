"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dailyMail_1 = require("./config/dailyMail");
console.log("Spinning up timeslot background workers");
(0, dailyMail_1.dailyCron)();
