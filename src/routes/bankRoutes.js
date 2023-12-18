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
  transfer
} = bankController;

const router = express.Router();

router.get("/", getAccessToken);
router.post(
  "/createBeneficiary",
  authenticate,
  authenticateBank,
  createBeneficiary
);
router.get("/checkBankReceived", authenticateBank, checkBankReceived);

router.get("/getAccounts", authenticateBank, getAccounts);
router.get("/getBeneficiary", authenticateBank, getBeneficiary);
router.get("/getTransactions", authenticateBank, getTransactions);

router.post("/:userId/transferMoney", authenticateBank, transferMoney);
router.post("/transfer", authenticateBank, transfer);

module.exports = router;
