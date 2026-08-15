const {cloudinaryConfig,auth}=require("./lib");
module.exports=async(req,res)=>{
 if(!auth(req))return res.status(401).json({message:"Unauthorized"});
 const cloudinary=cloudinaryConfig(),timestamp=Math.floor(Date.now()/1000);
 const signature=cloudinary.utils.api_sign_request({timestamp,folder:"sarkar-garage/vehicles"},process.env.CLOUDINARY_API_SECRET);
 res.json({timestamp,signature,apiKey:process.env.CLOUDINARY_API_KEY,cloudName:process.env.CLOUDINARY_CLOUD_NAME});
};
