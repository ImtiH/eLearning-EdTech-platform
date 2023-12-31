import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  QuestionOutlined,
  UploadOutlined,
  UserSwitchOutlined
} from "@ant-design/icons";
import { Avatar, Button, List, Modal, Tooltip } from "antd";
import Item from "antd/lib/list/Item";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import AddLessonForm from "../../../../components/forms/AddLessonForm";
import InstructorRoute from "../../../../components/routes/InstructorRoute";

const CourseView = () => {
  const [course, setCourse] = useState({});
  const [visible, setVisible] = useState(false);
  const [values, setValues] = useState({
    title: "",
    content: "",
    video: {},
  });
  const [uploading, setUploading] = useState(false);
  const [uploadButtonText, setUploadButtonText] = useState("Upload Video");
  const [progress, setProgress] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);

  const router = useRouter();
  const { slug } = router.query;

  console.log("router.query", router.query); 

  useEffect(() => {
    loadCourse();
  }, [slug]);

    useEffect(() => {
      course && studentCount();
    }, [course]);

  const loadCourse = async () => {
    const { data } = await axios.get(`/api/course/${slug}`);
    setCourse(data);
  };


  const handleAddLesson = async (e) => {
    e.preventDefault();
    console.log("course - handleAddLesson ", course);
    try {
      const { data } = await axios.post(
        `/api/course/lesson/${slug}/${course.instructor._id}`,
        values
      );
      console.log("handleAddLesson- ", data);
      setValues({ ...values, title: "", content: "", video: {} });
      setVisible(false);
      setProgress(0);
      setUploadButtonText("Upload video");
      setCourse(data);
      toast("Lesson added");
    } catch (err) {
      console.log(err);
      toast("Lesson add failed");
    }
  };

  const handleVideo = async (e) => {
    console.log("course instructor", course.instructor._id); 
    try {
      console.log("files -client", e.target.files);
      const file = e.target.files[0];
      setUploadButtonText(file.name);
      setUploading(true);

      const videoData = new FormData();
      videoData.append("video", file);
      const { data } = await axios.post(
        `/api/course/video-upload/${course.instructor._id}`,
        videoData,
        {
          onUploadProgress: (e) => {
            setProgress(Math.round((100 * e.loaded) / e.total));
          },
        }
      );
      setValues({ ...values, video: data });
      setUploading(false);
    } catch (err) {
      console.log(err);
      setUploading(false);
      toast("Video upload failed");
    }
  };

  const handleVideoRemove = async () => {
    try {
      setUploading(true);
      const { data } = await axios.post(
        `/api/course/video-remove/${course.instructor._id}`,
        values.video
      );
      console.log(data);
      setValues({ ...values, video: {} });
      setUploading(false);
      setProgress(0);
      setUploadButtonText("Upload another video");
    } catch (err) {
      console.log(err);
      setUploading(false);
      toast("Video remove failed");
    }
  };

  const handlePublish = async () => {
    try {
      let answer = window.confirm(
        "Once you publish your course, it will be live in the marketplace for students to enroll."
      );
      console.log("course publish answer", answer);

      if (!answer) return;
      
      const { data } = await axios.put(`/api/course/publish/${course._id}`);
      toast("Congrats. Your course is now live in the marketplace!");
      setCourse(data); 
    } catch (err) {
      toast("Course publish failed. Try again");
    }
  };

  const handleUnpublish = async () => {

    try {
      let answer = window.confirm(
        "Once you unpublish your course, it will not appear in the marketplace for students to enroll."
      );
      if (!answer) return;
      const { data } = await axios.put(`/api/course/unpublish/${course._id}`);
      toast("Your course is removed from the marketplace!");
      setCourse(data);
    } catch (err) {
      toast("Course unpublish failed. Try again");
    }
  };

  
  
  const studentCount = async () => {
    const { data } = await axios.post(`/api/instructor/student-count`, {
      courseId: course._id,
    }); 
    console.log("STUDENT COUNT => ", data);
    setEnrolledCount(data.length);
  };

  return (
    <InstructorRoute>
      <div className="contianer-fluid pt-3">
        {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
        {course && (
          <div className="container-fluid pt-1">
            <div className="media pt-2">
              <Avatar
                size={80}
                src={
                  course.image ? course.image.Location : "/images/bootstrap.png"
                }
              />

              <div className="media-body pl-2">
                <div className="row">
                  <div className="col">
                    <h5 className="mt-2 text-primary">{course.name}</h5>
                    <p style={{ marginTop: "-10px" }}>
                      {course?.lessons && course?.lessons?.length} Lessons
                    </p>
                    <p style={{ marginTop: "-15px", fontSize: "10px" }}>
                      {course.category}
                    </p>
                  </div>

                  <div className="d-flex pt-4">
                    <Tooltip title={`${enrolledCount} Enrolled`}>
                      <UserSwitchOutlined className="h5 pointer text-primary mr-4" />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <EditOutlined
                        className="h5 pointer text-info mr-4"
                        onClick={() =>
                          router.push(`/instructor/course/edit/${slug}`)
                        }
                      />
                    </Tooltip>

                    {course.lessons && course.lessons.length < 5 ? (
                      <Tooltip title="Min 5 lessons required to publish">
                        <QuestionOutlined className="h5 pointer text-danger" />
                      </Tooltip>
                    ) : course.published ? (
                      <Tooltip title="Unpublish">
                        <CloseOutlined
                          onClick={handleUnpublish}
                          className="h5 pointer text-danger"
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Publish">
                        <CheckOutlined
                          onClick={handlePublish}
                          className="h5 pointer text-success"
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col">
                <ReactMarkdown source={course.description} />
              </div>
            </div>
            <div className="row">
              <Button
                onClick={() => setVisible(true)}
                className="col-md-6 offset-md-3 text-center"
                type="primary"
                shape="round"
                icon={<UploadOutlined />}
                size="large"
              >
                Add Lesson
              </Button>
            </div>

            <br />

            <Modal
              title="+ Add Lesson"
              centered
              visible={visible}
              onCancel={() => setVisible(false)}
              footer={null}
            >
              <AddLessonForm
                values={values}
                setValues={setValues}
                handleAddLesson={handleAddLesson}
                uploading={uploading}
                uploadButtonText={uploadButtonText}
                handleVideo={handleVideo}
                progress={progress}
                handleVideoRemove={handleVideoRemove}
              />
            </Modal>

            <div className="row pb-5">
              <div className="col lesson-list">
                <h4>
                  {course && course?.lessons && course.lessons?.length} Lessons
                </h4>
                <List
                  itemLayout="horizontal"
                  dataSource={course && course.lessons}
                  renderItem={(item, index) => (
                    <Item>
                      <Item.Meta
                        avatar={<Avatar>{index + 1}</Avatar>}
                        title={item.title}
                      ></Item.Meta>
                    </Item>
                  )}
                ></List>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorRoute>
  );
};

export default CourseView;
