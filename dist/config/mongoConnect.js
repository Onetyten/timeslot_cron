"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const mongoUrl = process.env.MONGO_STRING;
if (!mongoUrl) {
    throw new Error("No mongodb connection string found, please add it to the .env file");
}
let cachedConnection = globalThis.mongoose;
if (!cachedConnection) {
    cachedConnection = globalThis.mongoose = { conn: null, promise: null };
}
function mongoConnect() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cachedConnection.conn) {
            console.log("found cached connection");
            return cachedConnection.conn;
        }
        if (!cachedConnection.promise) {
            const opts = {
                bufferCommands: false
            };
            cachedConnection.promise = mongoose_1.default.connect(mongoUrl, opts).then((mongoose) => {
                return mongoose;
            });
        }
        cachedConnection.conn = yield cachedConnection.promise;
        return cachedConnection.conn;
    });
}
exports.default = mongoConnect;
