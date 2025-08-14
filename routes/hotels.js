const express=require("express");
const router=express.Router();
const hotel = require("../modals/hotel");

router.get('/api/hotels',async(req,res)=>{
    const hotels =await hotel.find()
    res.json(hotels)
})
module.exports=router