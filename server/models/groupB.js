import mongoose from "mongoose";

const {Schema} = mongoose;

const vipStoreSchemaB = new Schema({
    vip_number: Number,
    customer_email: String
  });
  
  mongoose.model("vipB", vipStoreSchemaB);