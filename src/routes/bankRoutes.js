const express = require("express");
const bankController = require("../controllers/bankController");
const { authenticate } = require("../middlewares/authBank")

const { getAccessToken, getAccounts, createBeneficiary, getBeneficiary, transferMoney, getTransactions, getRefundDetails } = bankController;



const router = express.Router();

router.get("/", getAccessToken);
router.get("/getAccounts", authenticate, getAccounts)
router.post('/createBeneficiary', authenticate, createBeneficiary)
router.get('/getBeneficiary', authenticate, getBeneficiary)
router.post('/transferMoney', authenticate, transferMoney)
router.get('/getTransactions', authenticate, getTransactions)
router.get('/getRefundDetails', authenticate, getRefundDetails)


module.exports = router;