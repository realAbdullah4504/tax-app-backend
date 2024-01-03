const { NetworkContextImpl } = require("twilio/lib/rest/supersim/v1/network");
const sendAppResponse = require("../utils/helper/appResponse");

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
const BankDefaultValues = require("../models/bankDefaultValues");
const UserService = require("../services/userService");
const User = require("../models/userModel");

exports.saveDefaultValues = async (req, res, next) => {
  const values = req.body;
  try {
    const data = await BankDefaultValues.findOneAndUpdate({}, values, {
      upsert: true,
      new: true,
    });
    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Default values saved successfully.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
exports.getUserBankDetails = async (req, res, next) => {
  try {
    const { userId } = req?.query || "";
    const data = await BankDetails.findOne({ userId });
    if (!data) {
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

exports.getRefundDetails = async (req, res, next) => {
  try {
    const userId = req?.query?.userId || "";
    console.log(userId);
    const { data, totalRefund } = await BankServices.getTotalRefundByUserId(
      userId
    );

    sendAppResponse({
      res,
      data,
      totalRefund,
      statusCode: 200,
      status: "success",
      message: "Transactions fetched successfully.",
    });
  } catch (error) {
    console.log(error);
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

    const payload = {
      userId: id,
      accountTitle: data.name,
      iban: data.accounts[0].iban,
      beneficiaryId: data.id,
      ppsn: ppsn,
      receivedDate: null,
      netRebate: 0,
      refundReceived: "notRefundReceived",
      paymentStatus: "noManualReview",
      totalReceivedBankAmount: 0,
    };
    const bankDetails = await BankServices.createBeneficiaryDatabase(
      id,
      payload
    );

    sendAppResponse({
      res,
      // data,
      bankDetails,
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
        userId,
        receivedDate,
        ppsn,
        totalReceivedBankAmount,
        paymentStatus,
      } = detail;

      const { totalRefund, data: refundList } =
        await BankServices.getTotalRefundByUserId(userId);
      const { submittedDate } = (refundList && refundList[0]) || {};

      console.log(
        "userId",
        userId,
        "submittedDate",
        submittedDate,
        "totalRefund",
        totalRefund,
        "paymentStatus",
        paymentStatus
      );

      if (
        submittedDate &&
        totalRefund > 0 &&
        paymentStatus === "noManualReview"
      ) {
        const transactions = await BankServices.getTransactions(
          ppsn,
          submittedDate,
          headers,
          receivedDate
        );

        if (transactions.length) {
          const totalAmountTransactions =
            totalReceivedBankAmount +
            transactions.reduce((total, transaction) => {
              return total + transaction.legs[0].amount;
            }, 0);
          console.log("totalAmountTransactions", totalAmountTransactions);

          const newReceivedDate = transactions.length
            ? transactions[0].created_at
            : receivedDate;
          console.log("newReceivedDate", newReceivedDate);

          const receivedStatus = transactions.length
            ? "refundRcvd"
            : "notRefundReceived";

          //for updating the receivedDate
          await BankServices.saveBankDetails(
            { userId, ppsn },
            {
              receivedDate: newReceivedDate,
              totalReceivedBankAmount: totalAmountTransactions,
              refundReceivedStatus: receivedStatus,
            }
          );

          await UserService.updatedUser({
            id: userId,
            data: { stage: "refundRcvd" },
          });

          const positiveTotalReceivedBankAmount = Math.abs(
            totalAmountTransactions
          );
          const initiate = await BankServices.validTransfer(
            positiveTotalReceivedBankAmount,
            totalRefund
          );

          let netRebate = 0;
          if (initiate !== "noManualReview") {
            const { customerOfferCode } =
              (await UserService.fetchUserDetail(userId)) || {};
            console.log("customerOfferCode", customerOfferCode);

            netRebate = await BankServices.getKYCCalculations(
              customerOfferCode,
              positiveTotalReceivedBankAmount
            );
            await BankServices.saveBankDetails(
              { userId, ppsn },
              {
                paymentStatus: initiate,
                netRebate,
              }
            );
          }
        }
      } else if (paymentStatus !== "noManualReview") {
        const transactions =
          (await BankServices.getTransactions(
            userId,
            submittedDate,
            headers,
            null
          )) || [];

        if (transactions.length) {
          console.log("transactions=================", transactions[0].state);
          const bankDetails =
            transactions.length &&
            (await BankDetails.findOneAndUpdate(
              { userId, ppsn },
              {
                paymentStatus: transactions[0].state,
              },
              { new: true, upsert: true }
            ));
        }
      }
    }
    //   console.log("bankDetails", bankDetails);

    sendAppResponse({
      res,
      statusCode: 200,
      status: "success",
      message: "Bank details updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};
exports.getRefundReceivedDetails = async (req, res, next) => {
  try {
    const data = await BankDetails.find({});
    let results = [];
    for (const detail of data) {
      const {
        userId,
        receivedDate,
        totalReceivedBankAmount,
        accountTitle,
        paymentStatus,
        refundReceivedStatus,
      } = detail;

      const { totalRefund, data: refundList } =
        await BankServices.getTotalRefundByUserId(userId);
      const { submittedDate } = (refundList && refundList[0]) || {};
      
      
      if (
        submittedDate &&
        totalRefund > 0 &&
        refundReceivedStatus === "refundRcvd"
        ) {          
          const user = await User.findOne({ _id: userId }, '-_id firstName surName email phoneNumber createdAt');
          const { firstName, surName, email, phoneNumber, createdAt } = user || {};

        const details = {
          accountTitle,
          submittedDate,
          receivedDate,
          totalRcvd: totalReceivedBankAmount,
          refundExpected: totalRefund,
          paymentStatus,
          refundReceivedStatus,
          userId,
          firstName,
          surName, 
          email,
          phoneNumber, 
          createdAt
        };
        results.push(details);
      }
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
exports.transferMoney = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // console.log("userId", userId);
    const headers = req.headers;

    const accountDetails = await BankDetails.findOne({ userId });
    const { beneficiaryId, netRebate, paymentStatus } = accountDetails || {};

    if (paymentStatus === "noManualReview") {
      return sendAppResponse({
        res,
        statusCode: 400,
        status: "error",
        message:
          "Cannot initiate payment. Please contact support. Manual Review required.",
      });
    }
    const reference = generateRandomReferenceId(userId);

    const payload = {
      request_id: reference,
      account_id: ACCOUNT_REVOLUT,
      receiver: {
        counterparty_id: beneficiaryId,
      },
      amount: netRebate,
      currency: "EUR",
      reference: reference,
    };
    console.log("transferDetails", payload);

    const transfer = await BankServices.transferMoney(userId, payload, headers);
    sendAppResponse({
      res,
      transfer,
      statusCode: 200,
      status: "success",
      message: "Transfer created successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    next(error);
  }
};

exports.refundReceivedUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const headers = req.headers;
    const accountDetails = await BankDetails.findOne({ userId: userId });
    const { ppsn } = accountDetails;
    const { data: refundList } = await BankServices.getTotalRefundByUserId(
      userId
    );
    const { submittedDate } = (refundList && refundList[0]) || {};

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
    const { ppsn } = accountDetails;
    const { data: refundList } = await BankServices.getTotalRefundByUserId(
      userId
    );
    const { submittedDate } = (refundList && refundList[0]) || {};
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
        if (transaction.state === "completed") {
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

exports.transfer = async (req, res, next) => {
  try {
    const payload = req.body;
    const headers = req.headers;
    console.log(req.body);
    const apiUrlPost = `${REVOLUT_URL}/pay`;
    const data = await axios.post(apiUrlPost, payload, { headers });

    sendAppResponse({
      res,
      data,
      statusCode: 200,
      status: "success",
      message: "Transfer created successfully.",
    });
  } catch (error) {
    console.error(error);
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
