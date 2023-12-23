const express = require("express");
const bankController = require("../controllers/bankController");
const { authenticateBank } = require("../middlewares/authBank");
const { authenticate } = require("../middlewares/auth");



const {
  getAccessToken,
  getAccounts,
  createBeneficiary,
  getBeneficiary,
  transferMoney,
  getTransactions,
  checkBankReceived,
  transfer,
  refundReceivedUserDetails,
  paymentDetails,
  getRefundDetails
} = bankController;

const router = express.Router();

router.get("/", getAccessToken);
router.get("/getAccounts", authenticate, getAccounts)
router.post('/createBeneficiary', authenticate, createBeneficiary)
router.get('/getBeneficiary', authenticate, getBeneficiary)
router.post('/transferMoney', authenticate, transferMoney)
router.get('/getTransactions', authenticate, getTransactions)
router.get('/getRefundDetails', authenticate, getRefundDetails)

router.get("/userRefundDetails", authenticateBank, refundReceivedUserDetails);
router.get("/paymentDetails", authenticateBank, paymentDetails);

router.get("/getAccounts", authenticateBank, getAccounts);
router.get("/getBeneficiary", authenticateBank, getBeneficiary);
router.get("/getTransactions", authenticateBank, getTransactions);

router.post("/:userId/transferMoney", authenticateBank, transferMoney);
router.post("/transfer", authenticateBank, transfer);

module.exports = router;
