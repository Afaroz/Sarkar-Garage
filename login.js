const {crypto}=require("./lib");
module.exports=async(req,res)=>{
 if(req.method!=="POST")return res.status(405).json({message:"Method not allowed"});
 const {username,password}=req.body||{};
 if(username!==process.env.ADMIN_USERNAME||password!==process.env.ADMIN_PASSWORD)return res.status(401).json({message:"Invalid username or password"});
 const token=crypto.createHmac("sha256",process.env.ADMIN_SECRET).update("sarkar-garage-admin").digest("hex");
 res.json({token});
};
