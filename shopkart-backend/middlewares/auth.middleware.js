const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

const protect = async (req, res, next) => {
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({message:'Not authorized, no token'});
        
    }
    //verify token signature and expiration
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    //find the customer by id in the token payload
    const customer = await Customer.findById(decoded.id).select('-password');
    if(!customer){
        return res.status(401).json({message:'Not authorized, customer not found'});
    
}

//Attach customer to req.user for downstream middleware and route handlers
req.user = customer;
next();
    }catch(err){
        console.error(err);
        res.status(401).json({message:'Not authorized, token failed'});
    }
};
module.exports = {protect};
