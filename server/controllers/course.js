import AWS from "aws-sdk";
import { readFileSync } from "fs";
import { nanoid } from "nanoid";
import slugify from "slugify";
import Completed from "../models/completed";
import Course from "../models/course";
import User from "../models/user";
const stripe = require("stripe")(process.env.STRIPE_SECRET); 

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

console.log("awsConfig S3", awsConfig);

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {

  try {
    const { image } = req.body; 
    if (!image) return res.status(400).send("No image");

    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1]; 
    // image params
    const params = {
      Bucket: "elearnproject-bucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ContentEncoding: "base64",
      ContentType: "image/jpeg",
    }; 

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log("uploaded image- ", data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    // console.log("image-", image);

    // image params
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    // send remove request to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const create = async (req, res) => {
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });
    if (alreadyExist) return res.status(400).send("Title is taken");

    const course = await new Course({
      slug: slugify(req.body.name),
      instructor: req.user._id,
      ...req.body,
    }).save();

    res.json(course);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Course create failed. Try again.");
  }
};

export const read = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("instructor", "_id name")
      .exec(); 
    res.json(course);
  } catch (err) {
    console.log(err);
  }
};

export const uploadVideo = async (req, res) => {

  try {
    if (req.user._id != req.params.instructorId) {
      return res.status(400).send("Unauthorized");
    }

    const { video } = req.files; 
    console.log("uploaded video", video);

    if (!video) return res.status(400).send("No video");

    // video params
    const params = {
      Bucket: "elearnproject-bucket",
      Key: `${nanoid()}-${video.name.trim().replace(/\s+/g, "-")}`,
      Body: readFileSync(video.path),
      ContentType: video.type,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log("data after upload", data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeVideo = async (req, res) => {
  try {
    if (req.user._id != req.params.instructorId) {
      return res.status(400).send("Unauthorized");
    }
    const { Bucket, Key } = req.body;

    // video params
    const params = {
      Bucket,
      Key,
    };

    // upload to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log(data);
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const addLesson = async (req, res) => {
  try {
    const { slug, instructorId } = req.params;
    const { title, content, video } = req.body;

    if (req.user._id != instructorId) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate(
      { slug },
      {
        $push: { lessons: { title, content, video, slug: slugify(title) } }, 
      },
      { new: true }
    )
      .populate("instructor", "_id name")
      .exec();

    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Add lesson failed");
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug }).exec(); 

    if (req.user._id != course.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();

    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
};

export const removeLesson = async (req, res) => {
  const { slug, lessonId } = req.params;
  const course = await Course.findOne({ slug }).exec();
  console.log("COURSE - removeLEsson => ", course);

  // return;

  if (req.user._id != course.instructor._id) {
    return res.status(400).send("Unauthorized");
  }

  const deletedCourse = await Course.findByIdAndUpdate(course._id, {
    $pull: { lessons: { _id: lessonId } },
  }).exec();

  res.json({ ok: true });
};

export const updateLesson = async (req, res) => {
  try {
    const { slug } = req.params;
    const { _id: lessonId, title, content, video, free_preview } = req.body;
    const course = await Course.findOne({ slug }).select("instructor").exec();

    if (req.user._id != course.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.updateOne(
      { "lessons._id": lessonId },
      {
        $set: {
          "lessons.$.title": title,
          "lessons.$.content": content,
          "lessons.$.video": video,
          "lessons.$.free_preview": free_preview,
        },
      },
      { new: true } 
    ).exec();

    console.log("updated lesson => ", updated);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Update lesson failed");
  }

};

export const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    // find course
    const course = await Course.findById(courseId).select("instructor").exec();
    console.log("course - publish => ", course);


    // is owner?
    if (req.user._id != course.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    let coursePublished = await Course.findByIdAndUpdate(
      courseId,
      { published: true },
      { new: true }
    ).exec();
    console.log("course published", coursePublished);
    res.json(coursePublished);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Publish course failed");
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select("instructor").exec();
    console.log("course - unpublish => ", course);



    if (req.user._id != course.instructor._id) {
      return res.status(400).send("Unauthorized");
    }

    let courseUnpublished = await Course.findByIdAndUpdate(
      courseId,
      { published: false },
      { new: true }
    ).exec();
    console.log("course unpublished", courseUnpublished);
    // return;
    res.json(courseUnpublished);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unpublish course failed");
  }
};

export const courses = async (req, res) => {
  // all published courses
  const all = await Course.find({ published: true })
    .limit(11)
    .populate("instructor", "_id name")
    .exec(); 

  res.json(all);
};

export const checkEnrollment = async (req, res) => {
  const { courseId } = req.params;

  const user = await User.findById(req.user._id).exec();
  console.log("user courses", user); 
  let ids = [];
  console.log("course ids", ids); 

  let length = user.courses && user.courses.length; 
  console.log("length", length); 
  for (let i = 0; i < length; i++) {
    ids.push(user.courses[i].toString());
  }
  res.json({
    status: ids.includes(courseId),
    course: await Course.findById(courseId).exec(),
  });
};

export const freeEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).exec();
    if (course.paid) return;
    console.log("freeEnrollement - course", course);


    const result = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { courses: course._id },
      },
      { new: true }
    ).exec(); 
    console.log(result);
    res.json({
      message: "Congratulations! You have successfully enrolled",
      course,
    });
  } catch (err) {
    console.log("free enrollment err", err);
    return res.status(400).send("Enrollment failed");
  }
};

export const paidEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("instructor")
      .exec(); 
    console.log("paidEnrollement - course", course);

    if (!course.paid) return;
    // application/paltform fee 30%
    const fee = (course.price * 30) / 100;
    // create stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(course.price.toFixed(2) * 100),
            product_data: {
              name: course.name,
            },
          },
        },
      ],
      mode: "payment", 
      payment_intent_data: {
        application_fee_amount: Math.round(fee.toFixed(2) * 100),
        transfer_data: {
          destination: course.instructor.stripe_account_id,
        },
      },
      success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`, 
      cancel_url: process.env.STRIPE_CANCEL_URL, 
    });
    console.log("paidEnrollment - SESSION => ", session);

    await User.findByIdAndUpdate(req.user._id, {
      stripeSession: session,
    }).exec(); 
    res.send(session.id);
  } catch (err) {
    console.log("PAID ENROLLMENT ERR", err);
    return res.status(400).send("Enrollment  failed");
  }
};


export const stripeSuccess = async (req, res) => {
  try {
    // find course
    const course = await Course.findById(req.params.courseId).exec();
    // get user from db to get stripe session id
    const user = await User.findById(req.user._id).exec();

    if (!user.stripeSession.id) return res.sendStatus(400);

    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    console.log("STRIPE SUCCESS", session);
    if (session.payment_status === "paid") {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { courses: course._id }, 
        $set: { stripeSession: {} }, 
      }).exec();
    }
    res.json({ success: true, course });
  } catch (err) {
    console.log("STRIPE SUCCESS ERR", err);
    res.json({ success: false });
  }
};

export const userCourses = async (req, res) => {
  //done by me
  try {
    const user = await User.findById(req.user._id).exec();
    const courses = await Course.find({ _id: { $in: user.courses } }) 
      .populate("instructor", "_id name") 
      .exec();
    res.json(courses);
  } catch (err) {
    console.log(err);
    res.status(400).send("Error getting enrolled courses");
  }
};

export const markCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const updated = await Completed.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      {
        $addToSet: { lessons: lessonId },
      },
      { new: true }
    ).exec(); 

    if (!updated) {
      const newCompleted = await new Completed({
        user: req.user._id,
        course: courseId,
        lessons: [lessonId],
      }).save();
      console.log("newCompleted", newCompleted);
      return res.json({ ok: true });
    }

    console.log("updated", updated);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Mark completed failed");
  }
};

export const listCompleted = async (req, res) => {
  try {
    const list = await Completed.findOne({
      user: req.user._id,
      course: req.body.courseId,
    }).exec();
    list && res.json(list.lessons);
  } catch (err) {
    console.log(err);
  }
};

export const markIncomplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;

    const updated = await Completed.findOneAndUpdate(
      {
        user: req.user._id,
        course: courseId,
      },
      {
        $pull: { lessons: lessonId },
      }
    ).exec();
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
  }
};
