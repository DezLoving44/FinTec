require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const UserModel = require('./models/Users');
const DonationModel = require('./models/Donationdetails');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/users")
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// USER REGISTRATION
app.post('/register', (req, res) => {
  UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err));
});

// USER LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          res.json("Success");
        } else {
          res.json("Incorrect Password");
        }
      } else {
        res.json("User not found");
      }
    });
});

// CREATE DONATION
app.post('/donation', (req, res) => {
  console.log("RECEIVED DONATION DATA:", req.body);
  DonationModel.create(req.body)
    .then(data => res.json(data))
    .catch(err => {
      console.error("Failed to save donation:", err);
      res.status(500).json({ error: "Failed to save donation" });
    });
});

// SEARCH DONATIONS
app.get('/donations/search', async (req, res) => {
  const { firstname, middlename, lastname, year } = req.query;

  try {
    const query = { firstname, middlename, lastname };

    if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(Number(year) + 1, 0, 1);
      query.date = { $gte: start, $lt: end };
    }

    const donations = await DonationModel.find(query);
    res.json(donations);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});
//Save Changes
app.put('/donations/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;

  try {
    const result = await DonationModel.findByIdAndUpdate(id, update, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update donation', details: err });
  }
});

//Delete donations
app.delete('/donations/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await DonationModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete donation', details: err });
  }
});


// BULK RECEIPTS BY YEAR
app.get('/donations/bulk-receipts', async (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  const startDate = new Date(`${year}-01-01T00:00:00Z`);
  const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00Z`);

  try {
    const donations = await DonationModel.find({
      date: { $gte: startDate, $lt: endDate }
    });

    const grouped = {};
    for (const donation of donations) {
      const key = `${donation.firstname}|~|${donation.middlename || ''}|~|${donation.lastname}`;
      if (!grouped[key]) {
        grouped[key] = {
          firstname: donation.firstname,
          middlename: donation.middlename,
          lastname: donation.lastname,
          email: donation.email,
          donations: []
        };
      }
      grouped[key].donations.push(donation);
    }

    const result = Object.values(grouped);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching bulk receipts.' });
  }
});
app.get('/getInfo', async (req, res) => {
  try {
    const donations = await DonationModel.find({});
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});


app.listen(3001, () => {
  console.log("server is running at http://localhost:3001");
});
