import queryString from "query-string";
import Course from "../models/course";
import User from "../models/user";
const stripe = require("stripe")(process.env.STRIPE_SECRET);

export const makeInstructor = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).exec();
    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({ type: "express" }); 
      console.log("Stripe ACCOUNT => ", account.id);
      user.stripe_account_id = account.id;
      await user.save();
    }

    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding",
    });
    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email,
    });

    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`); 
  } catch (err) {
    console.log("MAKE INSTRUCTOR ERR ", err);
  }
};


export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    console.log(" retrieved Stripe ACCOUNT => ", account);

    if (!account.charges_enabled) {
      return res.status(401).send("Unauthorized");
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: account,
          $addToSet: { role: "Instructor" }, 
        },
        { new: true } 
      )
        .select("-password")
            .exec();
      res.json(statusUpdated);
    }
  } catch (err) {
    console.log(err);
  }
};



export const currentInstructor = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password").exec(); 
    if (!user.role.includes("Instructor")) {
      return res.sendStatus(403); 
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};

export const instructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 }).exec(); 
    console.log("instructorCourses courses", courses);
    res.json(courses);
  } catch (err) {
    console.log(err);
  }
};

export const studentCount = async (req, res) => {
  try {
    const users = await User.find({ courses: req.body.courseId })
      .select("_id")
      .exec();
    
    console.log("studentCount", users);
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};



export const instructorBalance = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).exec();
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });
    res.json(balance);
  } catch (err) {
    console.log(err);
  }
};


export const instructorPayoutSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_seller.id,
      { redirect_url: process.env.STRIPE_SETTINGS_REDIRECT }
    );
    res.json(loginLink.url);
  } catch (err) {
    console.log("stripe payout settings login link err => , err");
  }
};
