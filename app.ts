import { dailyCron } from "./config/dailyMail"





console.log("Spinning up timeslot background workers")
dailyCron()
