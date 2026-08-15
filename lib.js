const {MongoClient}=require("mongodb");
const crypto=require("crypto");
let clientPromise;
function db(){
 if(!process.env.MONGODB_URI)throw new Error("MONGODB_URI is missing");
 if(!clientPromise)clientPromise=MongoClient.connect(process.env.MONGODB_URI);
 return clientPromise.then(c=>c.db(process.env.MONGODB_DB||"sarkar_garage"));
}
function cloudinaryConfig(){
 const cloudinary=require("cloudinary").v2;
 cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET});
 return cloudinary;
}
function auth(req){
 const h=req.headers.authorization||"";const token=h.startsWith("Bearer ")?h.slice(7):"";
 if(!token||!process.env.ADMIN_SECRET)return false;
 const expected=crypto.createHmac("sha256",process.env.ADMIN_SECRET).update("sarkar-garage-admin").digest("hex");
 return token.length===expected.length&&crypto.timingSafeEqual(Buffer.from(token),Buffer.from(expected));
}
module.exports={db,cloudinaryConfig,auth,crypto};
