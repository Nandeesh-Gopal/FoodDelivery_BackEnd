const mongo=require("mongoose")
const express=require("express")
const cors=require("cors")
const session=require("express-session")
const app= express()
require("dotenv").config()
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized:true,
    cookie: {secure:false}
}))

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))
app.use(express.json())

mongo.connect(process.env.MONGO_URI)
.then(()=>console.log("connected successfully"))
.catch(err=>console.log("err:",err))
const hotelsRouter=require("./routes/hotels")
app.use("/",hotelsRouter)
const schema= new mongo.Schema(
    {
        name:String,
        email:{
            type:String,
            unique:false
        },
        password:String
    }
)

const schema2=new mongo.Schema(
    {
        userId: {
            type: mongo.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        userEmail: String,
        location: String,
        phoneNo: String,
        payment: String,
        items: [{
            name: String,
            quantity: Number,
            price: Number,
            total: Number
        }],
        totalAmount: Number,
        orderDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            default: 'pending'
        }
    }
)

const Order_details=mongo.model('order_details',schema2)
const User = mongo.model('user',schema)

function isAuthenticated(req,res,next){
    if(req.session.userId){
        return next()
    }
    return res.status(401).json({message:"please log in"})
}

app.post("/signup", async (req,res) => {
    const {name,email,password}=req.body
    try {
        const existingUser =await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"Email already exists"})
        }
        const temp=new User({name,email,password})
        await temp.save()
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user" });
    }
})

app.post("/login", async (req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email:email})
    if(!user||user.password!==password){
        return res.status(401).json({message:"Invalid"})
    }
    req.session.userId =user._id
    req.session.email=user.email
    console.log(req.session)
    return res.status(200).json({message:"success"})
})

app.post("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
         return res.status(500).json({ message: "Logout failed" });
    }
    console.log(req.session)
    res.json({ message: "Logged out successfully" });
    })
})

app.get("/check-session", (req, res) => {
    if (req.session && req.session.userId) {
        return res.status(200).json({ active: true })
    } else {
        return res.status(200).json({ active: false })
    }
})

app.get("/checkAuth",isAuthenticated,(req,res)=>{
    if( req.session &&req.session.userId){
        return res.status(200).json({loggedIn:true})
    }
    else{
        return res.status(200).json({loggedIn:false})
    }
})

app.post("/place-order", isAuthenticated, async (req, res) => {
    try {
        const { location, phoneNo, payment, items, total } = req.body;
        
        if (!location || !phoneNo || !payment || !items || items.length === 0) {
            return res.status(400).json({ message: "All fields are required and cart must not be empty" });
        }

        const newOrder = new Order_details({
            userId: req.session.userId,
            userEmail: req.session.email,
            location: location,
            phoneNo: phoneNo,
            payment: payment,
            items: items,
            totalAmount: total
        });

        await newOrder.save();
        
        console.log(`Order placed successfully for user: ${req.session.email}`);
        
        res.status(201).json({ 
            message: "Order placed successfully",
            orderId: newOrder._id
        });
        
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order. Please try again." });
    }
});

app.get("/orders", isAuthenticated, async (req, res) => {
    try {
        const orders = await Order_details.find({ userId: req.session.userId })
        
        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

app.listen(5000,()=>console.log("server is running"))