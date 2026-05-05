const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require('../models/listing.js');

main()
    .then((res) => {
        console.log("Connected to MongoDb");
    })
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://Bhagwat:hD9FEhN5mCGIWhWg@cluster0.dsk5myo.mongodb.net/wanderlust?appName=Cluster0');
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "69f8b764698c889357467fbc" }));
    await Listing.insertMany(initData.data);
    console.log("DB seeded successfully");
}

initDB();