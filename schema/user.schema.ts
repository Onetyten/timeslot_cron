import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{ type:String, required:true, unique:true},
    password:{type:String, required:true},
    refreshToken:[{
        token:{type:String, required:true},
        expiresAt : {type:Date, required:true},
        createdAt:{type:Date,default:Date.now()}
    }]},
{timestamps:true}
)

const userProfile = mongoose.model('userProfile', userSchema)
export default userProfile