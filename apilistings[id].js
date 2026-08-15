const {db,auth}=require("../lib");
const {ObjectId}=require("mongodb");
module.exports=async(req,res)=>{
 if(req.method!=="DELETE")return res.status(405).json({message:"Method not allowed"});
 if(!auth(req))return res.status(401).json({message:"Unauthorized"});
 try{await (await db()).collection("bikes").deleteOne({_id:new ObjectId(req.query.id)});res.json({ok:true});}
 catch(e){res.status(400).json({message:"Invalid listing id"});}
};
