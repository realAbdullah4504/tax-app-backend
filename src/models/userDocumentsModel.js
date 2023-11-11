const mongoose = require("mongoose");


const userDocumentsSchema = new mongoose.Schema({
userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
},
filesDetail: [{name:String, description:String}],
},
{
  timestamps: true,
});

const UserDocuments = mongoose.model("UserDocuments", userDocumentsSchema);

module.exports = UserDocuments;