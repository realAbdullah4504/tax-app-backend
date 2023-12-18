const { ACCOUNT_REVOLUT, REVOLUT_URL } = require("../../config/vars");
const AppError = require("../errors/AppError");
const BankDetails = require("../models/bankDetailsModel");
const { default: axios } = require("axios");

function getEndDate(submittedDate, receivedDate) {
  const newReceivedDate = receivedDate
    ? new Date(receivedDate.getTime() + 5)
    : null;

  const startDate = newReceivedDate ? newReceivedDate : submittedDate;
  const year = new Date(submittedDate).getFullYear();
  const endDate =
    new Date().getFullYear() === year ? new Date() : new Date(`${year}-12-31`);

  return { startDate, endDate };
}

const BankServices = {
  async createBeneficiaryRevolut(user, headers) {
    try {
      const apiUrlPost = `${REVOLUT_URL}/counterparty`;
      const { data } = await axios.post(apiUrlPost, user, { headers });

      return data;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  },

  async createBeneficiaryDatabase(id, payload) {
    try {
      const bankDetails = await BankDetails.findOneAndUpdate(
        { userId: id },
        payload,
        {
          runValidators: true,
          upsert: true,
          new: true,
        }
      );

      return bankDetails;
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  },

  async getTransactions(ppsn, submittedDate, receivedDate, headers) {
    try {
      const apiUrlGet = `${REVOLUT_URL}/transactions`;
      const { startDate, endDate } = getEndDate(submittedDate, receivedDate);
      //   console.log("startDate", startDate, "endDate", endDate);

      const params = {
        from: startDate,
        to: endDate,
        account: ACCOUNT_REVOLUT,
      };

      const { data } = await axios.get(apiUrlGet, { headers, params });
      if (!data.length) {
        return [];
      }

      const filteredTransactions = data?.filter((transaction) =>
        transaction?.reference?.includes(ppsn)
      );
      // console.log("filteredTransactions", filteredTransactions);
      return filteredTransactions;
    } catch (error) {
      throw new AppError(error, 500);
    }
  },

  async initiateTransfer(
    { userId, ppsn, totalRefundAmount },
    newReceivedDate,
    totalAmountTransactions
  ) {
    // console.log(
    //   ppsn,
    //   userId,
    //   totalAmountTransactions,
    //   newReceivedDate,
    //   totalReceivedBankAmount,
    //   totalRefundAmount
    // );
    try {
      //for testing
      let totalBank = Math.abs(totalAmountTransactions);
      const initiate =
      totalBank === Math.floor(totalRefundAmount)
          ? "Initiate Payment"
          : "Cannot Initiate Payment";
      // console.log("initiate", initiate);
      console.log(totalBank);

      const bankDetails = await BankDetails.findOneAndUpdate(
        { userId, ppsn },
        {
          totalReceivedBankAmount: totalBank,
          receivedDate: newReceivedDate,
          status: initiate,
        },
        { new: true }
      );

      //   console.log("Updated bankDetails:", bankDetails);
      return bankDetails;
    } catch (error) {
      console.error("Error updating bank details:", error.message);
      throw AppError(error.message, 500);
    }
  },
  async transferMoney(userId, payload, headers) {
    try {
      const apiUrlPost = `${REVOLUT_URL}/pay`;
      const { data } = await axios.post(apiUrlPost, payload, { headers });

      if (!data) {
        throw new AppError("Transfer failed", 500);
      }
      await BankDetails.findOneAndUpdate({ userId }, { status: "pending" });

      return data;
    } catch (error) {
      console.error("Error:", error);
      throw AppError(error.message, 500);
    }
  },
};

module.exports = BankServices;
