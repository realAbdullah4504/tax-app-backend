const FamilyDetail = require("../models/familyDetailsModel");

/**
 * service methods to operate family details 
 */
const FamilyDetailService = {
    /**
     * service method to return user family detail
     * @param {*} userId 
     * @returns 
     */
    async fetchUserFamilyDetail(userId){
        return await FamilyDetail.findOne({userId})
     },
}

module.exports = FamilyDetailService;