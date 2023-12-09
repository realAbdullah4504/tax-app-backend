const User = require('../../models/userModel');
 const adminDetails= {
        "firstName": "admin",
        "surName": "user",
        "email":"admin@taxpro.com",
        "password":"admin@123",
        "role":"admin",
        "userType": "member",
        "phoneNumber": "+353872397782",
        "tob": false,
        "taxAgent": false,
        "isActive": false,
        "is2FA": false,
    }

module.exports = async()=>{
    try {
        const adminUser = await User.findOne({role:'admin'});
        if(!adminUser){
          await  User.create(adminDetails);
        }
    } catch (error) {
        console.log(error);
    }
}
