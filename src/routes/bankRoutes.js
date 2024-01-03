const express = require("express");
const bankController = require("../controllers/bankController");
const { authenticateBank } = require("../middlewares/authBank");
const { authenticate } = require("../middlewares/auth");

const {
  getUserBankDetails,
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
  getRefundDetails,
  saveDefaultValues,
  getRefundReceivedDetails
} = bankController;

const router = express.Router();

router.get("/", getAccessToken);

router.post(
  "/createBeneficiary",
  authenticate,
  authenticateBank,
  createBeneficiary
);
router.post("/saveDefaultValues", saveDefaultValues);
router.get(
  "/checkBankReceived",
  authenticate,
  authenticateBank,
  checkBankReceived
);
router.get("/getRefundReceivedDetails",authenticate,authenticateBank,getRefundReceivedDetails)

router.get("/getUserBankDetails", getUserBankDetails);
router.get("/getRefundDetails", authenticate, getRefundDetails);

router.get(
  "/userRefundDetails",
  authenticate,
  authenticateBank,
  refundReceivedUserDetails
);
router.get("/paymentDetails", authenticate, authenticateBank, paymentDetails);

router.get("/getAccounts", authenticate, authenticateBank, getAccounts);
router.get("/getBeneficiary", authenticate, authenticateBank, getBeneficiary);
router.get("/getTransactions", authenticate, authenticateBank, getTransactions);

router.post(
  "/:userId/transferMoney",
  authenticate,
  authenticateBank,
  transferMoney
);

router.post("/transfer", authenticate, authenticateBank, transfer);

module.exports = router;
