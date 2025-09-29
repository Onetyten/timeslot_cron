import dotenv from 'dotenv'
dotenv.config()
import mongoose, { Mongoose } from 'mongoose'

const mongoUrl:string | undefined = process.env.MONGO_STRING

if (!mongoUrl){
    throw new Error("No mongodb connection string found, please add it to the .env file")
}

interface cachedConnection{
    conn:Mongoose | null,
    promise:Promise<Mongoose> | null
}

declare global{
    var mongoose:cachedConnection
}

let cachedConnection = globalThis.mongoose;

if (!cachedConnection){
    cachedConnection = globalThis.mongoose = {conn:null, promise:null}
}

async function mongoConnect():Promise<Mongoose>{
    if (cachedConnection.conn){
        console.log("found cached connection")
        return cachedConnection.conn
    }
    if (!cachedConnection.promise){
        const opts = {
            bufferCommands:false
        }
        cachedConnection.promise = mongoose.connect(mongoUrl as string,opts).then((mongoose)=>{
            return mongoose
        })
    }
    cachedConnection.conn = await cachedConnection.promise
    return cachedConnection.conn
}


export default mongoConnect