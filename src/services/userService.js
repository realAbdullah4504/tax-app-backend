const fs = require('fs');
const path = require('path');
const twilio = require('twilio');
const crypto = require('crypto');
const { PDFDocument, rgb } = require('pdf-lib');
const User = require('../models/userModel');
const FamilyDetails = require('../models/familyDetailsModel');
const HealthDetails = require('../models/healthDetailsModel');
const HomeDetails = require('../models/homeDetailsModel');
const OtherDetails = require('../models/otherDetailsModel');
const PersonalInfo = require('../models/personalDetailsModel');
const AppError = require('../errors/AppError');
const { ObjectId } = require('mongodb');

const { ACCOUNT_SID, AUTH_TOKEN, VERIFY_SID } = require('../../config/vars');
const pdfFieldData = require('../utils/constant/signPDF');
const PersonalDetails = require('../models/personalDetailsModel');

const client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

const filterObj = (obj = {}, allowedFields = []) => {
  const newObj = {};
  allowedFields.map((key) => {
    if (obj.hasOwnProperty(key)) newObj[key] = obj[key];
  });
  return newObj;
};
const getSchemaByType = (type) => {
  switch (type) {
    case 'personalInfo':
      return PersonalInfo;
    case 'homeDetails':
      return HomeDetails;
    case 'healthDetails':
      return HealthDetails;
    case 'familyDetails':
      return FamilyDetails;
    case 'otherDetails':
      return OtherDetails;
    case 'user':
      return User;
    default:
      throw new Error('Invalid type');
  }
};
const UserService = {
  async registerUser(userData) {
    try {
      const user = new User(userData);
      const resp = await user.save();
      return resp;
    } catch (error) {
      throw error;
    }
  },

  async updatedUser({ id, data }) {
    // filtered out the unwanted fields that are not allowed to be updated
    // const filterBody = filterObj(body, ["name", "email"]);

    // update the current user data
    await User.findByIdAndUpdate(id, data, {
      new: false,
      runValidator: true,
    });
  },

  async userExists({ email, phoneNumber }) {
    // Function to check if a user exists by email or phone number:
    const count = await User.countDocuments({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    return count;
  },

  async sendVerificationCode(phoneNumber) {
    try {
      const verification = await client.verify.v2
        .services(VERIFY_SID)
        .verifications.create({ to: phoneNumber, channel: 'sms' });
    } catch (error) {
      console.error('Error sending verification code:', error.message);
      throw new AppError('Phone number does not exist/Incorrect.', 400);
    }
  },
  async VerifyUserCode(phoneNumber, code) {
    try {
      const verification = await client.verify.v2
        .services(VERIFY_SID)
        .verificationChecks.create({ to: phoneNumber, code: code });
      if (!verification?.valid || verification.status === 'pending') {
        throw new AppError('Your code is invalid', 400);
      }
    } catch (error) {
      console.error('Error sending verification code:', error.message);
      throw new AppError('Your code is invalid', 400);
    }
  },

  async findUserByEmail(email) {
    return User.findOne({ email }).select('+password');
  },

  async findUserByPhone(phoneNumber) {
    return await User.findOne({ phoneNumber }); //.select('+password');
  },

  async findUserById(id) {
    const resp = await User.findById(id); //.select('+password');
    return resp;
  },

  async authenticateUser(email, password) {
    const user = await this.findUserByEmail(email);
    if (!user || !(await user.isValidPassword(password))) {
      return null;
    }
    return user;
  },

  generateToken(user) {
    return user.generateToken();
  },

  async loginUser(email, password) {
    try {
      const user = await this.authenticateUser(email, password);
      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw error;
    }
  },
  async getCurrentUserDetail(id) {
    try {
      const UserInfo = await User.findOne({ _id: id });
      const personalInfo = await PersonalInfo.findOne({ userId: id });
      const homeDetails = await HomeDetails.findOne({ userId: id });
      const healthDetails = await HealthDetails.findOne({ userId: id });
      const familyDetails = await FamilyDetails.findOne({ userId: id });
      const otherDetails = await OtherDetails.findOne({ userId: id });
      const userDetail = {
        user: UserInfo || {},
        personalInfo: personalInfo || {},
        homeDetails: homeDetails || {},
        healthDetails: healthDetails || {},
        familyDetails: familyDetails || {},
        otherDetails: otherDetails || {},
      };
      return userDetail;
    } catch (error) {
      throw error;
    }
  },
  async updateCurrentUser(id, type, payload) {
    try {
      const Model = getSchemaByType(type);
      const condition = type === 'user' ? { _id: id } : { userId: id };
      const updatedUser = await Model.findOneAndUpdate(condition, payload, {
        upsert: true,
        new: true,
      });
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },
  async forgotPasswordUser(email, baseUrl) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('There is no user with the email address.', 404);
      }
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });
      const resetUrl = `${baseUrl}/${resetToken}`;
      // console.log('resetToken', resetToken);

      return resetUrl;
    } catch (error) {
      throw error;
    }
  },
  async resetPasswordUser(token, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new AppError('password and confirm password.', 400);
    }
    // 1 Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });
    // 2 if token is not expired, there is a user, set new password
    if (!user) {
      throw new AppError('Token is invalid or expired.', 400);
    }
    // 3 update the changePasswordAt property for the user
    user.userType = 'customer';
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    const resp = await user.save();
    return resp;
  },

  /**
   * Fetch users list
   * @param {*} type
   */
  async fetchUsersList(type, filters) {
    const { firstName, lastName, email, stage, member } = filters;
    const query = {
      ...(firstName && { firstName: new RegExp(firstName, 'i') }),
      ...(lastName && { surName: new RegExp(lastName, 'i') }),
      ...(email && { email: new RegExp(email, 'i') }),
      ...(type && { userType: new RegExp(type, 'i') }),
      ...(stage && { stage: new RegExp(stage, 'i') }),
      ...(member && { leadMember: member }),
    };
    return await User.find(query);
  },

  /**
   * Fetch user detail
   * @param {*} id
   */
  async fetchUserDetail(id, personalDetail) {
    let query = User.findById(id);
    if (personalDetail) {
      query = PersonalDetails.findOne({ userId: id }).populate('userId');
    }
    return await query.exec();
  },

  /**
   * Fetch user question detail
   * @param {*} type
   * @param {*} userId
   * @returns
   */
  async fetchUserQuestionsDetail(type, userId) {
    const Model = getSchemaByType(type);
    return await Model.findOne({ userId });
  },

  /**
   *
   * @param {*} userId
   * @returns
   * service function to delete user by id
   */
  async deleteUser(userId) {
    return await User.deleteOne({ _id: userId });
  },

  /**
   * service function to block and unblock user
   * @param {*} status
   * @param {*} userId
   * @returns
   */
  async blockUser(status, userId) {
    let isBlocked = undefined;
    isBlocked = status === 'blocked' ? true : false;
    return await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      {
        new: false,
        runValidator: true,
      }
    );
  },

  /**
   * service functio to reset user password by admin
   * @param {*} userId
   * @returns
   */
  async resetMemberPassword(userId) {
    const user = await User.findById(userId);
    const newPassword = Math.random().toString(36).slice(2);
    user.password = newPassword;
    await user.save();
    return newPassword;
  },

  async assignMemberOrStage(ids, data) {
    return await User.updateMany(
      {
        _id: { $in: ids },
      },
      data
    );
  },

  async deleteUsers(ids) {
    return await User.deleteMany({
      _id: { $in: ids },
    });
  },

  async getSignedPDF(userId) {
    try {
      const personalDetail = await PersonalInfo.findOne({ userId });
      const userDetail = await User.findById(userId);
      const signatureData = userDetail?.signature || '';
      if (!signatureData || !signatureData.startsWith('data:image/png;base64,')) {
        throw new Error('user has not signed the document yet. or invalid signature');
      }
      const pdfBytes = fs.readFileSync('src/public/assets/document.pdf');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const signatureDataStr = signatureData.replace('data:image/png;base64,', '');
      const bufferData = Buffer.from(signatureDataStr, 'base64');
      const image = await pdfDoc.embedPng(bufferData);
      const pages = pdfDoc.getPages();
      const page = pages[1];
      page.drawImage(image, {
        x: 150,
        y: 170,
        width: 35,
        height: 35,
        color: rgb(0, 0, 0),
      });

      const form = pdfDoc.getForm();
      const dobText = this.getDOBText(personalDetail?.dateOfBirth);
      const signedDate = this.getSignatureDate();

      const pdfFieldData = [
        { name: 'I', text: `${userDetail?.firstName || ''} ${userDetail?.surName || ''}` },
        { name: 'email address', text: userDetail?.email },
        { name: 'Date of Birth', text: dobText || '' },
        { name: 'PPS Number', text: personalDetail?.ppsn || '' },
        { name: 'authorise', text: 'Tax Return Pro' },
        { name: 'undefined_5', text: '806940' },
        { name: 'Agentss', text: '47 Ranelagh Road' },
        { name: 'address', text: 'Ranelagh Dublin 6' },
        { name: 'undefined_6', text: 'IE48REVO99036034206728' },
        { name: 'undefined_8', text: 'REVOIE23' },
        { name: 'Text3', text: userDetail.surName },
        { name: 'Text4', text: signedDate },
        { name: 'Name of Account Holder', text: 'Tax Rebate Pro' },
      ];

      pdfFieldData.forEach(({ name, text }) => {
        const field = form.getTextField(name);
        field.setText(text);

        // Check if setFontSize is supported by the field (some fields may not support it)
        if (field.setFontSize && name !== 'email address') {
          field.setFontSize(12);
        }
      });

      // firstPageFields.forEach((field) => {

      // //   if (
      // //     field.getName() ===
      // //     'due to me by the Revenue Commissioners by electronic funds transfer to the following bank'
      // //   ) {
      // //     field.setText('due to bla bla');
      // //   }
      // //   if (
      // //     field.getName() ===
      // //     'insert name of tax agency on my behalf is refunded in a similar manner'
      // //   ) {
      // //     field.setText('__name_of_tax_agency');
      // //   }
      // //   if (field.getName() === 'same I understand that') {
      // //     field.setText('same I understand that');
      // //   }
      // //   if (field.getName() === 'understand that my agent') {
      // //     field.setText('agent_name');
      // //   }
      // //   if (field.getName() === 'I understand and agree that') {
      // //     field.setText('I understand and agree that');
      // //   }
      // //   if (
      // //     field.getName() ===
      // //     'insert name of tax agency in respect of the services carried out on'
      // //   ) {
      // //     field.setText('__services carried out on');
      // //   }
      // //   if (
      // //     field.getName() ===
      // //     'I confirm that I will provide the necessary documentation to'
      // //   ) {
      // //     field.setText('documentation agency name');
      // //   }
      // //   if (field.getName() === 'reliefs made to Revenue on my behalf by') {
      // //     field.setText('reliefs made to Revenue on my behalf by');
      // //   }
      // //   if (
      // //     field.getName() ===
      // //     'I confirm that I will provide details of all my sources of income to'
      // //   ) {
      // //     field.setText('income to');
      // //   }
      // //   if (field.getName() === 'I understand that') {
      // //     field.setText('I understand that');
      // //   }
      // //   if (
      // //     field.getName() ===
      // //     'I confirm that this authorisation will remain in force until Revenue is formally notified of its'
      // //   ) {
      // //     field.setText('notified of its');
      // //   }
      // //   if (field.getName() === 'select preferred option') {
      // //     field.setText('select preferred option');
      // //   }
      // });

      const modifiedPdfBytes = await pdfDoc.save();
      // const pdfFileName = `generated_pdfs/generated_${Date.now()}.pdf`;
      // const pdfFilePath = path.join(__dirname, pdfFileName);
      // fs.writeFileSync(pdfFilePath, modifiedPdfBytes);

      // Send the generated PDF back to the client
      return modifiedPdfBytes;
    } catch (error) {
      console.error(error);
      throw new AppError('Internal Server Error', 500);
    }
  },
  async getStudentsList(userId) {
    try {
      const data = await FamilyDetails.findOne({ userId });
      if (!data) {
        throw new AppError('There are no children against this user.', 404);
      }
      const { children } = data || [];
      return children ;
    } catch (error) {
      throw error;
    }
  },


  // Helper functions
  getDOBText (dateOfBirth) {
    if(!!dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const dobDay = dob.getDate() < 10 ? `0${dob.getDate()}` : dob.getDate();
      const dobMonth = dob.getMonth() < 10 ? `0${dob.getMonth()}` : dob.getMonth();
      const dobyear = dob.getFullYear();
      const dobText = `${dobDay}${dobMonth}${dobyear}`;
      return dobText;
    } return '';
  },

  getSignatureDate () {
    const currentDate = new Date();
    const signDay =
      currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : currentDate.getDate();
    const signMonth =
      currentDate.getMonth() < 10 ? `0${currentDate.getMonth()}` : currentDate.getMonth();
    const signyear = currentDate.getFullYear();
    return `${signDay}${signMonth}${signyear}`;
  },
};

module.exports = UserService;
