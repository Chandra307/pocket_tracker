const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
    try{
        const payload = jwt.verify(req.cookies.token, process.env.JWT_KEY_SECRET);        
        const user = await User.findById(payload.userId);
        req.user = user;
        next();
    }
    catch(err){
        // console.log(err, 'authorize middleware');
        res.status(401).json({err});
    }
}