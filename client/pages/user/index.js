import { PlayCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import axios from "axios";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import UserRoute from "../../components/routes/UserRoute";
import { Context } from "../../context";

const UserIndex = () => {
  const {
    state: { user },
  } = useContext(Context);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    enrolledCourses();
  }, []);

  const enrolledCourses = async () => {
    try {
    setLoading(true);
      const { data } = await axios.get("/api/user-courses");
    console.log("ENROLLED COURSES => ", data);
    
      setCourses(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
   }
  }


  return (
    <UserRoute>
      <>
        <h1 className="jumbotron text-center square">
          {/* <pre>{JSON.stringify(user, null, 4)}</pre> */}
          User Dashboard
        </h1>
        {/* <pre>{JSON.stringify(courses, null,4)}</pre> */}

        {loading && (
          <SyncOutlined
            spin
            className="d-flex justify-content-center display-1 text-danger p-5"
          />
        )}
        {courses &&
          courses?.map((course) => (
            <>
              <div className="media pt-2" key={course._id}>
                <Avatar
                  shape="square"
                  size={80}
                  src={course.image ? course.image.Location : "/course.png"}
                  //keep an image named course.png in the public folder as the default image.
                />

                <div className="media-body pl-2">
                  <div className="row">
                    <div className="col">
                      <Link
                        href={`/user/course/${course.slug}`}
                        className="pointer "
                      >
                        <a className="mt-2">
                          <h5 className="pt-2 text-primary">{course.name}</h5>
                        </a>
                      </Link>
                      <p
                        style={{ marginTop: "-10px" }}
                        className="font-weight-bold"
                      >
                        {course.lessons.length} Lessons
                      </p>

                      <p className="text-muted" style={{ marginTop: "-15px", fontsize:"12px" }}>
                        By {course.instructor.name}
                      </p>
                    </div>

                    <div className="col-md-3 mt-3 text-center">
                      <Link
                        href={`/user/course/${course.slug}`}
                      >
                        <PlayCircleOutlined className="h2 pointer text-primary" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ))}
      </>
    </UserRoute>
  );
};

export default UserIndex;
