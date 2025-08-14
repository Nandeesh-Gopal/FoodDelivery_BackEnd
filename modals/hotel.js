const mongo=require("mongoose")
const hotels= mongo.Schema({
    name:{type:String,require:true },
    image:{type:String,require:true}
})
if(hotels){
console.log("database created successfully")}
module.exports= mongo.model("Hotel",hotels)