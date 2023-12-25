const { ACCOUNT_REVOLUT, REVOLUT_URL } = require("../../config/vars");
const AppError = require("../errors/AppError");
const BankDefaultValues = require("../models/bankDefaultValues");
const BankDetails = require("../models/bankDetailsModel");
const TaxDetails = require("../models/calculationDetailsModel");
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
  async getTotalRefundByUserId(userId = "") {
    try {
      const taxDetails = userId
        ? await TaxDetails.find({ userId }).sort({ year: -1 })
        : [];

      let totalRefund = 0;
      const data = [];
      if (!taxDetails.length) return { data, totalRefund };
      taxDetails &&
        taxDetails.length &&
        taxDetails?.forEach(({ year, taxResult, updatedAt, createdAt }) => {
          const obj = {
            year,
            amount: taxResult && taxResult?.toFixed(2),
            submittedDate: updatedAt || createdAt,
          };
          data.push(obj);
          totalRefund += taxResult;
        });
      totalRefund = totalRefund && +totalRefund?.toFixed(2);
      return { data, totalRefund };
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  },
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

  async getTransactions(ppsn, submittedDate, headers, receivedDate) {
    try {
      const apiUrlGet = `${REVOLUT_URL}/transactions`;
      const { startDate, endDate } = getEndDate(submittedDate, receivedDate);
      console.log("startDate", startDate, "endDate", endDate);

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

  // async initiateTransfer(
  //   { userId, ppsn },
  //   totalRefundAmount,
  //   newReceivedDate,
  //   totalAmountTransactions
  // ) {

  //   try {
  //     //for testing
  //     const { status, initiate } = await validTransfer(totalAmountTransactions, 520);

  //     const netRebate= await getKYCCalculations("SW354", totalAmountTransactions);
  //     //   console.log("Updated bankDetails:", bankDetails);
  //     return { status, initiate, netRebate };
  //   } catch (error) {
  //     console.error("Error updating bank details:", error.message);
  //     throw new AppError(error.message, 500);
  //   }
  // },

  async validTransfer(totalBank, totalRefundAmount) {

    const bankDefaultValues = await BankDefaultValues.findOne({});
    console.log('======================================')
    const { errorBand, threshold, returnDifference } = bankDefaultValues || {};
    // console.log(bankDefaultValues);
    console.log(
      "errorBand",
      errorBand,
      "threshold",
      threshold,
      "returnDifference",
      returnDifference
    );
    console.log("totalBank", totalBank, "totalRefundAmount", totalRefundAmount);
  
    const calculatedErrorBand =
      (totalBank - totalRefundAmount) / totalRefundAmount;
    const calculatedReturnDifference = totalBank - totalRefundAmount;
    console.log("calculatedErrorBand", calculatedErrorBand);
    console.log("calculatedReturnDifference", calculatedReturnDifference);
  
    let initiate = "";
  
    if (totalRefundAmount < threshold) {
      initiate = "yes";
    } else if (
      calculatedErrorBand < errorBand / 100 ||
      calculatedReturnDifference < returnDifference
    ) {
      initiate = "No-Manual Review";
    } else {
      initiate = "yes";
    }

    console.log("initiate", initiate);
    return initiate;
  },
  
  async getKYCCalculations(customerOfferCode, totalBank) {
    console.log('======================================')
    const bankDefaultValues = await BankDefaultValues.findOne({});
    const { customerOfferCodes, VAT } = bankDefaultValues || {};
    const VATPercent=VAT/100;
  
    const code = customerOfferCodes.find(
      (code) => code.customerOfferCode === customerOfferCode
    )?.value;
  
    let trp = code ? code : 10;
    console.log("trp", trp);
  
    const trp1 = (trp / 100) * totalBank * (1 + VATPercent);
    console.log("trp fee min", trp1);
  
    const trp2 = 40 * (1 + VATPercent);
    console.log("trp fee max", trp2);
  
    const rebateNetValue = totalBank / (1 + VATPercent);
    console.log("rebateNetValue", rebateNetValue);
  
    const trpFee = Math.min(rebateNetValue, Math.max(trp1, trp2));
  
    console.log("trpFee", trpFee);
    const VATPrice = VATPercent * trpFee;
    console.log("VATPrice", VATPrice);
  
    const totalTrpFee = trpFee + VATPrice;
    console.log("totalTrpFee", totalTrpFee);
  
    const netRebate = totalBank - totalTrpFee;
    console.log("netRebate", netRebate);
    return netRebate;
  },

  async transferMoney(userId, payload, headers) {
    try {
      const apiUrlPost = `${REVOLUT_URL}/pay`;
      const { data } = await axios.post(apiUrlPost, payload, { headers });

      if (!data) {
        throw new AppError("Transfer failed", 500);
      }
      await BankDetails.findOneAndUpdate({ userId }, { paymentStatus: "pending" });

      return data;
    } catch (error) {
      console.error("Error:", error);
      throw new AppError(error.message, 500);
    }
  },
};

module.exports = BankServices;
