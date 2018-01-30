const router = require('express').Router();
const IdentityService = require('../service/IdentityService');

router.post('/login', function (req, res)
{
	new IdentityService().login(req.files.card.data)
		.then(function(idCardName) {
	        if (!idCardName) {
	            res.status(403).json({message: "Login failed"});
	        }
	        res.json({message: "Login Successful", accessToken: idCardName})    
    	})
    	.catch(function (error) {
    		console.log(error.message);
        	res.status(403).json({message: "Login failed", error: error.toString()})    
    	});
})

router.post('/ping', function (req, res)
{
  	new IdentityService().ping(req.headers.authorization)
		.then(function (userInfo) {
	        res.json({ user: userInfo })
	    })
	    .catch(function (error) {
	        res.status(500).json({error: error.toString()})    
	    });
})

router.post('/logout', function (req, res)
{
  	new IdentityService().logout(req.headers.authorization)
		.then(function () { 
	        res.json({ message: "User added Successfully" });
	    })
	    .catch(function(error) {
	        console.log(error);
	        res.status(500).json({ error: error.toString() })
	    });
})

module.exports = router;