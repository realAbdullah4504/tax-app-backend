const { NetworkContextImpl } = require("twilio/lib/rest/supersim/v1/network");
const sendAppResponse = require("../utils/helper/appResponse");
const TaxDetails = require("../models/calculationDetailsModel");
const axios = require("axios");

const {
  ACCOUNT_REVOLUT,
  CLIENT_ASSERTION,
  CLIENT_ID,
  REVOLUT_URL,
} = require("../../config/vars");

const BankDetails = require("../models/bankDetailsModel");
const PersonalDetails = require("../models/personalDetailsModel");

const CalculationDetails = require("../models/calculationDetailsModel");
const BankServices = require("../services/bankSerivce");
const {
  generateRandomReferenceId,
} = require("../utils/helper/randomReference");

exports.getUserBankDetails = async (req, res, next) => {
  try {
    const { userId } = req?.query || "";
    const data = await BankDetails.findOne({ userId }); 
    if(!data){
      return sendAppResponse({
        res,
        statusCode: 404,
        status: "error",
        message: "No record found against this user!",
      });
    }
    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      // message: "User updated successfully.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
exports.getAccessToken = async (req, res, next) => {
  try {
    // console.log(CLIENT_ASSERTION);
    const apiUrl = "https://sandbox-b2b.revolut.com/api/1.0/auth/token";

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    // console.log(req.query);
    const { code } = req.query;

    const requestData = {
      // grant_type: "authorization_code",
      // code: code,
      grant_type: "refresh_token",
      refresh_token: code,
      client_id: CLIENT_ID,
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: CLIENT_ASSERTION,
    };

    const { data } = await axios.post(
      apiUrl,
      new URLSearchParams(requestData).toString(),
      config
    );
    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      // message: "User updated successfully.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.createBeneficiary = async (req, res, next) => {
  try {
    const id = req?.body?.userId ? req?.body?.userId : req?.user?._id;
    const user = req.body;

    const headers = req.headers;

    const accountDetails = await BankDetails.findOne({ userId: id });

    if (accountDetails) {
      return sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message: "Beneficiary already exists.",
      });
    }
    const data = await BankServices.createBeneficiaryRevolut(user, headers);

    const { ppsn } = await PersonalDetails.findOne({ userId: id });
    //how to send the year to review
    const { taxResult } = (await CalculationDetails.findOne({
      userId: id,
      year: 2023,
    })) || { taxResult: 0 };

    const payload = {
      userId: id,
      accountTitle: data.name,
      iban: data.accounts[0].iban,
      beneficiaryId: data.id,
      ppsn: ppsn,
      submittedDate: "2023-01-01T00:00:00.000Z",
      receivedDate: null,
      totalReceivedBankAmount: 0,
      totalRefundAmount: taxResult,
    };

    const bankDetails = await BankServices.createBeneficiaryDatabase(
      id,
      payload
    );

    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Beneficiary created successfully.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.checkBankReceived = async (req, res, next) => {
  try {
    const data = await BankDetails.find({});
    const results = [];
    const headers = req.headers;

    for (const detail of data) {
      const {
        submittedDate,
        receivedDate,
        ppsn,
        totalReceivedBankAmount,
        totalRefundAmount,
      } = detail;

      if (submittedDate && totalRefundAmount > 0) {
        const transactions = await BankServices.getTransactions(
          ppsn,
          submittedDate,
          headers,
          receivedDate
        );
        //   console.log("transactions", transactions);

        //   total the transactions according to required ppsn

        if (transactions.length) {
          const totalAmountTransactions =
            Math.abs(totalReceivedBankAmount) +
            transactions.reduce((total, transaction) => {
              return total + transaction.legs[0].amount;
            }, 0);
          //   console.log("totalAmountTransactions", totalAmountTransactions);
          // console.log(transactions)
          const newReceivedDate = transactions.length
            ? transactions[0].created_at
            : receivedDate;
          //   console.log("newReceivedDate", newReceivedDate);

          //for initiation of payment
          const bankDetails = await BankServices.initiateTransfer(
            detail,
            newReceivedDate,
            totalAmountTransactions
          );
          results.push({ message: "Bank Details Updated", bankDetails });
        } else {
          results.push({ message: "No Transactions Found", detail });
        }
      } else {
        results.push({ message: "Cannot initiate", detail });
      }

      //   console.log("bankDetails", bankDetails);
    }

    sendAppResponse({
      res,
      data: results,
      statusCode: 200,
      status: "success",
      message: "Beneficiary fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
exports.refundReceivedUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const headers = req.headers;
    const accountDetails = await BankDetails.findOne({ userId: userId });
    const { submittedDate, ppsn } = accountDetails;
    // console.log(userId, submittedDate, ppsn);
    if (!submittedDate) {
      sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message: "Form is not Submitted yet.",
      });
    }
    const transactions = await BankServices.getTransactions(
      ppsn,
      submittedDate,
      headers,
      null
    );
    if (!transactions.length) {
      sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message: "No transactions found.",
      });
    }
    const totalAmountTransactions = transactions.reduce(
      (total, transaction) => {
        return total + transaction.legs[0].amount;
      },
      0
    );

    const refAmountCreated =
      transactions?.map((transaction) => ({
        reference: transaction.reference,
        transactionPrices: transaction.legs[0].amount,
        receivedDate: transaction.created_at,
      })) || [];

    sendAppResponse({
      res,
      data: {
        from: "1234",
        totalAmountTransactions,
        refAmountCreated,
      },
      statusCode: 200,
      status: "success",
      message: "Beneficiary fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
exports.paymentDetails = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const headers = req.headers;
    const accountDetails = await BankDetails.findOne({ userId: userId });
    const { submittedDate, ppsn } = accountDetails;
    // console.log(userId, submittedDate, ppsn);
    if (!submittedDate) {
      sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message: "Form is not Submitted yet.",
      });
    }
    const transactions = await BankServices.getTransactions(
      userId,
      submittedDate,
      headers,
      null
    );
    console.log(transactions);
    if (!transactions.length) {
      sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message: "No transactions found.",
      });
    }
    const totalAmountTransactions = transactions.reduce(
      (total, transaction) => {
        if (transaction.state === "pending") {
          return total + transaction.legs[0].amount;
        }
        return total;
      },
      0
    );

    const refAmountCreated =
      transactions?.map((transaction) => ({
        reference: transaction.reference,
        transactionPrices: transaction.legs[0].amount,
        status: transaction.state,
        receivedDate: transaction.created_at,
      })) || [];

    sendAppResponse({
      res,
      data: {
        from: "1234",
        totalAmountTransactions,
        refAmountCreated,
      },
      statusCode: 200,
      status: "success",
      message: "Beneficiary fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

exports.transferMoney = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // console.log("userId", userId);
    const headers = req.headers;

    const accountDetails = await BankDetails.findOne({ userId });
    const { beneficiaryId, totalRefundAmount } = accountDetails;

    if (!accountDetails) {
      return sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message: "Beneficiary not found.",
      });
    }
    const reference = generateRandomReferenceId(userId);

    const payload = {
      request_id: reference,
      account_id: ACCOUNT_REVOLUT,
      receiver: {
        counterparty_id: beneficiaryId,
      },
      amount: totalRefundAmount,
      currency: "EUR",
      reference: reference,
    };

    if (accountDetails.status === "Initiate Payment") {
      const transfer = await BankServices.transferMoney(
        userId,
        payload,
        headers
      );
      sendAppResponse({
        res,
        transfer,
        statusCode: 200,
        status: "success",
        message: "Transfer created successfully.",
      });
    }

    sendAppResponse({
      res,
      statusCode: 400,
      status: "error",
      message: "Transfer cannot be initiated.",
    });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

exports.transfer = async (req, res, next) => {
  try {
    const payload = req.body;
    const headers = req.headers;

    const apiUrlPost = `${REVOLUT_URL}/pay`;
    const { data } = await axios.post(apiUrlPost, payload, { headers });

    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Transfer created successfully.",
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  const apiUrlGet = "https://sandbox-b2b.revolut.com/api/1.0/transactions";

  // console.log(params);

  try {
    const year = req?.body?.year;
    const startDate = new Date(`${year}-01-01`);
    const currentDate = new Date();
    const endDate =
      year === currentDate.getFullYear()
        ? currentDate
        : new Date(`${year}-12-31`);
    // console.log(year, startDate, endDate);

    const headers = req.headers;
    const params = {
      from: startDate,
      to: endDate,
      account: ACCOUNT_REVOLUT,
    };

    const { data } = await axios.get(apiUrlGet, { headers, params });
    if (!data.length) {
      return sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message: "No transactions found.",
      });
    }

    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Transactions fetched successfully.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getRefundDetails = async (req, res, next) => {
  try {
    const userId = req?.query?.userId || "";
    const taxDetails = await TaxDetails.find({ userId });
    let totalRefund = 0;
    const data = [];
    taxDetails &&
      taxDetails.length &&
      taxDetails?.forEach(({ year, taxResult, updatedAt, createdAt }) => {
        const obj = {
          year,
          amount: taxResult && taxResult?.toFixed(2),
          submitedDate: updatedAt || createdAt,
        };
        data.push(obj);
        totalRefund += taxResult;
      });
    totalRefund = totalRefund && totalRefund?.toFixed(2);
    sendAppResponse({
      res,
      data,
      totalRefund,
      statusCode: 200,
      status: "success",
      message: "Transactions fetched successfully.",
    });
  } catch (error) {}
};

exports.getAccounts = async (req, res, next) => {
  const apiUrlGet = "https://sandbox-b2b.revolut.com/api/1.0/accounts";

  const headers = req.headers;

  try {
    const { data } = await axios.get(apiUrlGet, { headers });

    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Accounts fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};

exports.getBeneficiary = async (req, res, next) => {
  const apiUrlGet = "https://sandbox-b2b.revolut.com/api/1.0/counterparties";

  const params = new URLSearchParams(req.query);
  const headers = req.headers;

  try {
    const { data } = await axios.get(apiUrlGet, { params, headers });
    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Beneficiary fetched successfully.",
    });
  } catch (error) {
    next(error);
  }
};
