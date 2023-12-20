const { NetworkContextImpl } = require("twilio/lib/rest/supersim/v1/network");
const sendAppResponse = require("../utils/helper/appResponse");
const TaxDetails = require("../models/calculationDetailsModel");
const axios = require("axios");



exports.getAccessToken = async (req, res, next) => {
    const apiUrl = "https://sandbox-b2b.revolut.com/api/1.0/auth/token";

    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };
    console.log(req.query);
    const { code } = req.query;

    const requestData = {
        grant_type: "authorization_code",
        code: code,
        // grant_type: "refresh_token",
        // refresh_token: code,
        client_id: "r6jst5grZeBdYn97O6JNtpvv1AV-qX1Ikv4My1ECTZM",
        client_assertion_type:
            "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion:
            "eyAgImFsZyI6ICJSUzI1NiIsICAidHlwIjogIkpXVCJ9.eyAgImlzcyI6ICJzcWNxNmotODAwMC5jc2IuYXBwIiwgICJzdWIiOiAicjZqc3Q1Z3JaZUJkWW45N082Sk50cHZ2MUFWLXFYMUlrdjRNeTFFQ1RaTSIsICAiYXVkIjogImh0dHBzOi8vcmV2b2x1dC5jb20iLCAgImV4cCI6IDE4NTgwNDI4MTl9.DI-KYfdgA3nkUQOVaINxWLQ95PG9fCTxmkukOXWrMECpeK9z4xXp9sLzAYp6cCGsSWs7Sb9rruy_texkMu61xsVCWbBJ6MHj9DtpBO8twBVD6qZ3BOe6i103yU-7tJtzEwFF6gfAQ09uYjqxtSLLiQcB0bTS04i5RPJCfutidPcP3k4IxLquuo3dCrq6s7bQ9i87kT0bFRDVnj4ro4hyWSMt7lCBQGdy2OLJo__AX8XjbQuoKyVyOrGqB33eIBkbobDDZVawPKZPYfCSVmZWUqpseS98vX4dwVWCY55I-APl403FeiOcdpkWWfZ37UriXeG_cxNIFwT1YS2TCIMPFg"
    };
    try {
        const { data } = await axios.post(
            apiUrl,
            new URLSearchParams(requestData).toString(),
            config,
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
}

exports.getAccounts = async (req, res, next) => {
    const apiUrlGet = "https://sandbox-b2b.revolut.com/api/1.0/accounts";

    const headers = req.headers

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
        next(error)
    }
};

exports.createBeneficiary = async (req, res, next) => {
    const apiUrlPost = "https://sandbox-b2b.revolut.com/api/1.0/counterparty";

    const headers = req.headers;

    console.log(req.body);

    const user = req.body;

    try {
        const { data } = await axios.post(apiUrlPost, user, { headers });
        sendAppResponse({
            res,
            data,
            statusCode: 200,
            status: "success",
            message: "Beneficiary created successfully.",
        })
    }
    catch (error) {
        next(error)
    }

}
exports.getBeneficiary = async (req, res, next) => {
    const apiUrlGet = "https://sandbox-b2b.revolut.com/api/1.0/counterparties";


    const params = new URLSearchParams(req.query)
    const headers = req.headers;

    try {
        const { data } = await axios.get(apiUrlGet, { params, headers });
        sendAppResponse({
            res,
            data,
            statusCode: 200,
            status: "success",
            message: "Beneficiary fetched successfully.",
        })
    }
    catch (error) {
        next(error);
    }
}


exports.transferMoney = async (req, res, next) => {
    const apiUrlPost = "https://sandbox-b2b.revolut.com/api/1.0/pay";
    let source = req.body;

    const headers = req.headers;
    console.log("Request Body:", source);
    console.log("Request Headers:", headers);

    try {
        const { data } = await axios.post(apiUrlPost, source, { headers });
        console.log("Response Data:", data);

        sendAppResponse({
            res,
            data,
            statusCode: 200,
            status: "success",
            message: "Transfer created successfully.",
        });
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
};
exports.getTransactions = async (req, res, next) => {
    const apiUrlGet = "https://sandbox-b2b.revolut.com/api/1.0/transactions";

    const headers = req.headers;

    try {

        const { data } = await axios.get(apiUrlGet, { headers });
        sendAppResponse({
            res,
            data,
            statusCode: 200,
            status: "success",
            message: "Transactions fetched successfully.",
        })

    } catch (error) {

    }

}
exports.getRefundDetails = async (req, res, next) => {
    try {
        const userId = req?.query?.userId || "";
        const taxDetails = await TaxDetails.find({userId});
        let totalRefund = 0; const data = [];
        (taxDetails && taxDetails.length) && taxDetails?.forEach(({ year, taxResult, updatedAt, createdAt }) => {
            const obj = {year, amount :taxResult && taxResult?.toFixed(2), submitedDate: (updatedAt || createdAt) };
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
        })

    } catch (error) {

    }

}

