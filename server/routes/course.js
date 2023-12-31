import express from "express";
import formidable from "express-formidable";

const router = express.Router();

// middleware
import { isEnrolled, isInstructor, requireSignin } from "../middlewares";

// controllers
import {
  addLesson,
  checkEnrollment,
  courses,
  create,
  freeEnrollment,
  listCompleted,
  markCompleted,
  markIncomplete,
  paidEnrollment,
  publishCourse,
  read,
  removeImage,
  removeLesson,
  removeVideo,
  stripeSuccess,
  unpublishCourse,
  update,
  updateLesson,
  uploadImage,
  uploadVideo,
  userCourses,
} from "../controllers/course";


router.get("/courses", courses); 

router.post("/course/upload-image", uploadImage);
router.post("/course/remove-image", removeImage);
// course
router.post("/course", requireSignin, isInstructor, create);
router.get("/course/:slug", read);
router.put("/course/:slug", requireSignin, update); 
router.post(
  "/course/video-upload/:instructorId",
  requireSignin,
  formidable(),
  uploadVideo
);

router.post("/course/video-remove/:instructorId", requireSignin, removeVideo); 
router.put("/course/publish/:courseId", requireSignin, publishCourse);
router.put("/course/unpublish/:courseId", requireSignin, unpublishCourse);

router.post("/course/lesson/:slug/:instructorId", requireSignin, addLesson);
router.put("/course/lesson/:slug/:lessonId", requireSignin, updateLesson); 
router.put("/course/:slug/:lessonId", requireSignin, removeLesson);

router.get("/check-enrollment/:courseId", requireSignin, checkEnrollment);

// enrollment
router.post("/free-enrollment/:courseId", requireSignin, freeEnrollment);
router.post("/paid-enrollment/:courseId", requireSignin, paidEnrollment);
router.get("/stripe-success/:courseId", requireSignin, stripeSuccess);

//user courses
router.get("/user-courses", requireSignin, userCourses);
router.get("/user/course/:slug", requireSignin, isEnrolled, read);

// mark completed
router.post("/mark-completed", requireSignin, markCompleted);
router.post("/list-completed", requireSignin, listCompleted);
router.post("/mark-incomplete", requireSignin, markIncomplete);




module.exports = router;
