const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
     path: "./config.env"
});

const app = require("./app");

//^Mongoose connection

mongoose.connect(process.env.DB, {
     useNewUrlParser: true,
     useCreateIndex: true,
     useFindAndModify: false,
     useUnifiedTopology: true
}).then(() => {
     console.log("Db connected");
}).catch(e => {
     console.log(e, "Failed to connect Db")
})


app.listen(process.env.PORT || 3001, () => {
     console.log("Server started");
})