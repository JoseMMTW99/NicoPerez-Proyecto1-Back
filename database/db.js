const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const dBUrl = process.env.URL;
const connectDB = async () => {
  try {
    await mongoose.connect(dBUrl);
    console.log('Conectada')
  } catch (error) {
    console.log('No Conectada')
  }
}

connectDB();
module.exports = { connectDB }