import {
  CheckCircleFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MinusCircleFilled,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Menu } from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import React, { createElement, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player";
import StudentRoute from "../../../components/routes/StudentRoute";

const { Item } = Menu;

const SingleCourse = () => {
  const [clicked, setClicked] = useState(-1); //clicked holds the index number of the lesson that is clicked
  const [collapsed, setCollapsed] = useState(false); // to make sidebar collapsible
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({ lessons: [] });
  const [completedLessons, setCompletedLessons] = useState([]); //empty array for now because the an array of completed lessons will be returned from the backend and will be stored in this state
  // force state update
  const [updateState, setUpdateState] = useState(false);

  // router
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (slug) loadCourse();
  }, [slug]);

  useEffect(() => {
    if (course) loadCompletedLessons();
  }, [course]);


  const loadCourse = async () => {
    const { data } = await axios.get(`/api/user/course/${slug}`);
    setCourse(data);
  };

  const loadCompletedLessons = async () => {
    const { data } = await axios.post(`/api/list-completed`, {
      courseId: course._id,
    });
    console.log("COMPLETED LESSONS => ", data);
    setCompletedLessons(data);
  };

  const markCompleted = async () => {
    const { data } = await axios.post(`/api/mark-completed`, {
      courseId: course._id,
      lessonId: course.lessons[clicked]._id,
    });
    console.log("LESSON COMPLETED => ", data);

    // loadCompletedLessons(); //without calling the function here, the tick mark doesn't show up immediately after clicking on the lesson. This will fetch the new completed lessons and re-render the component. [ this works too but instead of making a request to the database, we can just update the state and update the UI immediately.]

    setCompletedLessons([...completedLessons, course.lessons[clicked]._id]); //this will add the lesson id to the completedLessons state and hence, update the UI immediately. [make sure we are using spread spread operator in an array, without an array, this will not give the right output]

  };

  const markIncompleted = async () => {
    try {
      const { data } = await axios.post(`/api/mark-incomplete`, {
        courseId: course._id,
        lessonId: course.lessons[clicked]._id,
      }); // it will remove the lesson id from the completed lessons array in the database
      console.log(" markIncompleted - ", data);
      const all = completedLessons;
      console.log("ALL => ", all);
      const index = all.indexOf(course.lessons[clicked]._id);
      if (index > -1) {
        all.splice(index, 1);
        console.log("ALL WITHOUT REMOVED => ", all); //this removes the lesson id from the completed lessons array in the state  and is supposed to update the UI immediately, but it doesn't. To force state update, we can use the updateState state variable
        setCompletedLessons(all);
        setUpdateState(!updateState); //this will force to update the completedLessons state and hence, update the UI
      }
      // loadCompletedLessons(); //without calling the function here, the minus(-) mark doesn't show up immediately after clicking on the lesson ; this does the job too, but here we are getting completedLessons values from the database and re-rendering the component, instead of updating the removing the lesson from the state and update the UI.
    } catch (err) {
      console.log(err);
    }
  };

  if (!course.lessons || course.lessons.length < 1) {
    return <h3> You're not enrolled in this course.</h3>;
  }

  return (
    // {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
    // {/* <h1>Course slug is: {JSON.stringify(router.query.slug)}</h1> */}
    // {/* <h1>Course slug is: {router.query.slug}</h1> //works too; we can access a property without stringifying it */}
    // {/* <h1>Course slug is: {JSON.stringify(router.query)}</h1> */}
    // {/* <h1>Course slug is: {router}</h1> */}
    // {/*  Objects are not valid as a React child . if we don't stringify router, it will be an object*/}
    // {/* //{JSON.stringify(course.lessons[clicked])} // for the bottom div*/}
    <StudentRoute>
      <div className="row">
        <div style={{ maWidth: 320 }}>
          <Button
            onClick={() => setCollapsed(!collapsed)}
            className="text-primary mt-1 btn-block mb-2"
          >
            {createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}{" "}
            {!collapsed && "Lessons"}
          </Button>
          <Menu
            defaultSelectedKeys={[clicked]}
            inlineCollapsed={collapsed}
            style={{ height: "80vh", overflow: "scroll" }}
          >
            {course.lessons.map((lesson, index) => (
              <Item
                onClick={() => setClicked(index)}
                key={index}
                icon={<Avatar>{index + 1}</Avatar>}
              >
                {lesson.title.substring(0, 30)}
                {completedLessons.includes(lesson._id) ? (
                  <CheckCircleFilled
                    className="float-right text-primary ml-2"
                    style={{ marginTop: "13px" }}
                  />
                ) : (
                  <MinusCircleFilled
                    className="float-right text-danger ml-2"
                    style={{ marginTop: "13px" }}
                  />
                )}
              </Item>
            ))}
          </Menu>
        </div>

        <div className="col">
          {clicked !== -1 ? (
            <>
              {/* <div
                className="d-flex justify-content-between bg-primary align-items-center justify-content-center"
                style={{ height: "7vh" }}
              >
                <p className="font-weight-bold text-danger mt-2 ml-3">Heading Elements</p>
                <p className="text-danger mt-2 mr-3" onClick={() => markLessonComplete}>Mark as Completed</p>
              </div> */}
              <div className="col alert alert-primary square">
                <b>{course.lessons[clicked].title.substring(0, 30)}</b>
                {completedLessons.includes(course.lessons[clicked]._id) ? (
                  <span
                    className="float-right pointer"
                    onClick={markIncompleted}
                  >
                    Mark as incomplete
                  </span>
                ) : (
                  <span className="float-right pointer" onClick={markCompleted}>
                    Mark as completed
                  </span>
                )}
              </div>

              {course.lessons[clicked].video &&
                course.lessons[clicked].video.Location && (
                  <>
                    <div className="wrapper">
                      <ReactPlayer
                        className="player"
                        url={course.lessons[clicked].video.Location}
                        width="100%"
                        // height="100%"
                      controls //is the same as controls={true}
                      // light 
                      onEnded = {markCompleted}
                      />
                    </div>
                  </>
                )}

              <ReactMarkdown
                source={course.lessons[clicked].content}
                className="single-post"
              />
            </>
          ) : (
            <div className="d-flex justify-content-center p-5">
              <div className="text-center p-5">
                <PlayCircleOutlined className="text-primary display-1 p-5" />
                <p className="lead">Clcik on the lessons to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentRoute>
  );
};

export default SingleCourse;
