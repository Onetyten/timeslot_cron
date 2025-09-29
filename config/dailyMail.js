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
exports.dailyCron = dailyCron;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const node_cron_1 = __importDefault(require("node-cron"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const slot_schema_1 = __importDefault(require("../schema/slot.schema"));
const mongoConnect_1 = __importDefault(require("./mongoConnect"));
const user_schema_1 = __importDefault(require("../schema/user.schema"));
function dailyCron() {
    return __awaiter(this, void 0, void 0, function* () {
        const emailService = process.env.EMAIL_SERVICE;
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASSWORD;
        const oneYear = 365 * 24 * 60 * 60 * 1000;
        if (!emailService || !emailUser || !emailPass) {
            throw new Error("Email credentials not found in the .env file");
        }
        node_cron_1.default.schedule('* * * * *', () => __awaiter(this, void 0, void 0, function* () {
            // nodeCron.schedule('0 7 * * *',async ()=>{
            console.log("Running daily cron at", new Date().toLocaleDateString('en-us', { day: '2-digit', month: 'short', year: 'numeric' }));
            yield (0, mongoConnect_1.default)();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tommorrow = new Date(today);
            tommorrow.setDate(today.getDate() + 1);
            try {
                const todaySlot = yield slot_schema_1.default.find({ eventDate: { $gte: today, $lt: tommorrow } });
                if (todaySlot.length === 0) {
                    return console.log("no timeslot scheduled for today");
                }
                const transporter = nodemailer_1.default.createTransport({
                    service: emailService,
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });
                const emailPromises = todaySlot.map((slot) => __awaiter(this, void 0, void 0, function* () {
                    let mailOptions = {};
                    const sender = yield user_schema_1.default.findById(slot.userId);
                    if (!sender) {
                        console.log(`no sender founder for slot ${slot}`);
                        return Promise.resolve();
                    }
                    const formattedDate = new Date(slot.eventDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                    if (slot.type === 'birthday') {
                        mailOptions = {
                            from: `${sender.name} <${emailUser}>`,
                            to: slot.email,
                            subject: ``,
                            text: `Hi ${slot.name},

                        ${sender.name} wanted to wish you the happiest of birthdays today! 🥳🎂✨  
                        May your day be filled with joy, laughter, and unforgettable moments.

                        Here’s to another amazing year ahead—full of new adventures, success, and everything you’ve been wishing for.

                        Warm wishes,  
                        ${sender.name}`,
                        };
                    }
                    else {
                        mailOptions = {
                            from: `"Event Reminder" <${emailUser}>`,
                            to: slot.email,
                            subject: slot.name,
                            text: `Hello ${sender.name},

                    This is a reminder for your upcoming event.

                    Event: ${slot.name}  
                    Date: ${formattedDate}  

                    Set up by: ${sender.name}  

                    We hope everything goes smoothly and you enjoy this occasion!
                    Best regards,  
                    Timeslot Reminder Service`,
                        };
                    }
                    const result = yield transporter.sendMail(mailOptions);
                    console.log("Message sent: ", result);
                    if (slot.type == 'birthday') {
                        slot.eventDate = new Date(slot.eventDate.getTime() + oneYear);
                        yield slot.save();
                    }
                    else {
                        yield slot_schema_1.default.findByIdAndDelete(slot._id);
                    }
                    return result;
                }));
                yield Promise.all(emailPromises);
            }
            catch (error) {
                console.error(error);
            }
        }));
    });
}
