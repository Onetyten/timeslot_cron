"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SlotSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "userProfile", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, enum: ['birthday', 'event'], required: true },
    eventDate: { type: Date, required: true },
    relationship: { type: String },
}, { timestamps: true });
const timeSlot = mongoose_1.default.model('timeSlot', SlotSchema);
exports.default = timeSlot;
