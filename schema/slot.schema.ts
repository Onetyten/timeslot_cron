import { required } from "joi";
import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema({
    userId : {type:mongoose.Schema.Types.ObjectId, ref:"userProfile", required:true},
    name:{type:String, required:true},
    email:{type:String,required:true},
    type:{type:String, enum:['birthday','event'], required:true},
    eventDate:{type:Date,required:true},
    relationship:{type:String},
},{timestamps:true})

const timeSlot = mongoose.model('timeSlot',SlotSchema)
export default timeSlot