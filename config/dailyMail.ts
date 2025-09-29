import dotenv from 'dotenv'
dotenv.config()
import nodeCron from "node-cron";
import nodemailer from 'nodemailer'
import timeSlot from "../schema/slot.schema";
import mongoConnect from "./mongoConnect";
import userProfile from '../schema/user.schema';




export async function dailyCron() {
    const emailService = process.env.EMAIL_SERVICE
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASSWORD
    const oneYear = 365 * 24 * 60 * 60 * 1000
    if (!emailService || !emailUser || ! emailPass){
        throw new Error("Email credentials not found in the .env file")
    }
    // nodeCron.schedule('* * * * *',async ()=>{
    nodeCron.schedule('0 */6 * * *', async () => {
        console.log( "Running daily cron at",
        new Date().toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,}))
        await mongoConnect()
        const today = new Date()
        today.setHours(0,0,0,0)
        const tommorrow = new Date(today)
        tommorrow.setDate(today.getDate()+1)

        try {
            const todaySlot = await timeSlot.find({eventDate:{$gte:today,$lt:tommorrow}})
            if (todaySlot.length === 0){
                return console.log("no timeslot scheduled for today")
            }
            const transporter = nodemailer.createTransport({
                service:emailService,
                auth:{
                    user:emailUser,
                    pass:emailPass
                }
            })

            const emailPromises = todaySlot.map(async (slot)=>{

                
                let mailOptions = {}
                const sender = await userProfile.findById(slot.userId)
                if (!sender){
                    console.log(`no sender founder for slot ${slot}`)
                    return Promise.resolve()
                }
                const formattedDate = new Date(slot.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
                if (slot.type === 'birthday'){

                    mailOptions = {
                        from:`${sender.name} <${emailUser}>`,
                        to: slot.email,
                        subject:``,
                        text:`Hi ${slot.name},

                        ${sender.name} wanted to wish you the happiest of birthdays today! 🥳🎂✨  
                        May your day be filled with joy, laughter, and unforgettable moments.

                        Here’s to another amazing year ahead—full of new adventures, success, and everything you’ve been wishing for.

                        Warm wishes,  
                        ${sender.name}`,
                   }
                }
            else{
                mailOptions = {
                    from:`"Event Reminder" <${emailUser}>`,
                    to: slot.email,
                    subject:slot.name,
                    text:`Hello ${sender.name},

                    This is a reminder for your upcoming event.

                    Event: ${slot.name}  
                    Date: ${formattedDate}  

                    Set up by: ${sender.name}  

                    We hope everything goes smoothly and you enjoy this occasion!
                    Best regards,  
                    Timeslot Reminder Service`,
                }
            }
             const result = await transporter.sendMail(mailOptions)
             console.log("Message sent: ",result)
             if (slot.type=='birthday'){
                slot.eventDate = new Date(slot.eventDate.getTime() + oneYear)
                await slot.save()
             }
             else{
                await timeSlot.findByIdAndDelete(slot._id)
             }
             return result

        })
            await Promise.all(emailPromises)
        } 
        catch (error) {
            console.error(error)
        }
})
}