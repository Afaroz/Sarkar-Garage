const {db,auth}=require("./lib");
module.exports=async(req,res)=>{
 try{
  const col=(await db()).collection("bikes");
  if(req.method==="GET"){
   const docs=await col.find({status:{$ne:"sold"}}).sort({createdAt:-1}).toArray();
   return res.json(docs.map(x=>({...x,_id:x._id.toString()})));
  }
  if(req.method==="POST"){
   if(!auth(req))return res.status(401).json({message:"Unauthorized"});
   const x=req.body||{};
   if(!x.title||!x.price||!x.image)return res.status(400).json({message:"Title, price and image are required"});
   const doc={vehicleType:x.vehicleType||"Bike",title:x.title,year:x.year||"",km:x.km||"",price:Number(x.price),location:x.location||"",description:x.description||"",image:x.image,whatsapp:process.env.SELLER_WHATSAPP||"917499665959",status:"available",createdAt:new Date()};
   const r=await col.insertOne(doc);return res.status(201).json({_id:r.insertedId.toString(),...doc});
  }
  return res.status(405).json({message:"Method not allowed"});
 }catch(e){return res.status(500).json({message:e.message});}
};
