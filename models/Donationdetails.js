const mongoose = require("mongoose");

const DonationdetailsSchema = new mongoose.Schema({
  firstname: String,
  middlename: String,
  lastname: String,
  email: String,
  phone: String,
  street1: String,
  street2: String,
  city: String,
  country: String,
  zip: String,
  type: String,
  amount: String,
  comments: String,
  date: Date,
  paymentstatus: {
    type: String,
    default: 'pending',
  }
});

module.exports = mongoose.model("Donationdetails", DonationdetailsSchema);
