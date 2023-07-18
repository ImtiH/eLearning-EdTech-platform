import cors from "cors";
import express from "express";
// import fs from "fs";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { readdirSync } from "fs";
import mongoose from "mongoose";
const morgan = require("morgan");
require("dotenv").config();




const csrfProtection = csrf({ cookie: true }); 

// create express app
const app = express();

// apply middlewares
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));
app.use(cookieParser()); //cookie-parser is a middleware for parsing cookies in Express or Connect web frameworks. It allows you to access the cookies sent by the browser as an object in your Express request object. This package is useful for applications that need to handle multiple cookies or need to customize cookie parsing.
      //The res.cookie() method is provided by the cookie module in Node.js. This module is used by cookie-parser, which is a middleware for Express that parses cookies and makes them available in the req.cookies object. So, to use res.cookie(), you don't need to install cookie-parser, but you would need to import and use the cookie module directly. However, if you want to access cookies in the req.cookies object, you would need to use cookie-parser.


// app.use((req, res, next) => {
//to use a middleware you need to use app.use(). middleware is always a function that takes req and res as parameters. so, app.use(console.log("anik")) won't work but app.use((req, res,next) => {console.log("anik")) will work.
//   console.log("anik");
//   next();
// })

// route
// app.get("/", (req, res) => {
//     res.send("you hit server endpoint");
//     //moved to auth.js file  
// });
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`))); // to automatically load al the routes in the routes folder and get them here as a a middleware. Pretty much everything in nodejs is asynchronous. S, if we want anything to load synchronously, we can use Sync keyword. Meaning, this lien will execute after everything above has executed. here, /api is the prefix of the api. So, localhost:8000/api/register will be the route.



// csrf
app.use(csrfProtection); //applying csrfProtection as a middleware
app.get("/api/csrf-token", (req, res) => {
  //creating a route to get the csrf token. This route will be called from the frontend.
  console.log("CSRF server", req.csrfToken()); // tVWaC8R9-K7EtQ6BkDHSCnvskWO3jKiMDZyA
  res.json({ csrfToken: req.csrfToken() });
});



// port
const port = process.env.PORT || 8000;



// app.listen(port, () => console.log(`Server is running on port ${port}`));
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_STRING); // works for mongoose version 6.0.3. Installed ghe latest version 7 first and was throwing an error. So, downgraded to 6.0.3 and it worked.
      
    //   console.log(process.env.MONGO_STRING);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
