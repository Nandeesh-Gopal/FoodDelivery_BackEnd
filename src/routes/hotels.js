const express=require("express");
const router=express.Router();
const hotel = require("../modals/hotel");

router.get('/api/hotels',async(req,res)=>{
    const hotels =await hotel.find()
    res.json(hotels)
})
router.get('/:id/menu',async (req,res)=>{
    const hotel=await hotel.findById(req.params.id,"menu")
    if(!hotel){
        res.status(404).json({message:"hotel not found"})
    }
    res.json(hotel.menu)
})
module.exports=router