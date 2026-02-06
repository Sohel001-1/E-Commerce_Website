import jwt from 'jsonwebtoken';

const adminAuth=async (req,res,next)=>{
    try{
        const {token} = req.headers;
        if(!token){
            return res.json({success:false,message:"Unauthorized access! Login again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        if(token_decode.id !=="admin"){
            return res.json({success:false,message:"Unauthorized access! Login again"})

        }

        next()


    }catch (error) {
        console.log(error)
        res.json({success:false,message:"Unauthorized access! Login again"})
    
    
    
    
    }






}

export default adminAuth;