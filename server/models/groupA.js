import mongoose from "mongoose";

const {Schema} = mongoose;

const vipStoreSchemaA = new Schema({
    in_store_vip_number: String,
    used_online: Boolean
  });
  
  mongoose.model("vipA", vipStoreSchemaA);