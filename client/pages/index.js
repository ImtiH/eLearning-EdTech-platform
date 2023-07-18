import axios from "axios";
import CourseCard from "../components/cards/CourseCard";

const Index = ({ courses }) => {

  return (
    <>
      <h2 className="jumbotron text-center bg-primary square">
        {" "}
         eLearning - Online Education Marketplace
      </h2>
      <div className="container-fluid">
        <div className="row">
          {courses.map((course) => (
            <div key={course._id} className="col-md-4">
              <CourseCard key={course._id} course={course} />
              {/* <pre>{JSON.stringify(course, null, 4)}</pre> */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};


export async function getServerSideProps() {

  const { data } = await axios.get(`${process.env.API}/courses`); 
  return {
    props: {
      courses: data, 
    },
  };
}

export default Index;
