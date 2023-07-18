import { SyncOutlined } from "@ant-design/icons";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import UserRoute from "../../../components/routes/UserRoute";


const StripeSuccess = () => {
  // router
  const router = useRouter();
  const { id } = router.query;


  useEffect(() => {
    console.log("success -> ID", id);
    if (id) successRequest();
  }, [id]);

  const successRequest = async () => {
    const { data } = await axios.get(`/api/stripe-success/${id}`);
    console.log("SUCCESS REQUEST", id);
    console.log("SUCCESS REQUEST", data);
    router.push(`/user/course/${data.course.slug}`);
  }; 

  return (
    <UserRoute showNav={false}>
      <div className="row text-center">
        <div className="col-md-9 pb-5">
          <div className="d-flex justify-content-center p-5">
            <SyncOutlined spin className="display-1 text-danger p-5" />
          </div>
        </div>
        <div className="col-md-3"></div>
      </div>
    </UserRoute>
  );
};

export default StripeSuccess;
