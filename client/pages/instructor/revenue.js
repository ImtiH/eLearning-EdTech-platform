import {
  DollarOutlined,
  SettingOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import InstructorRoute from "../../components/routes/InstructorRoute";
import { stripeCurrencyFormatter } from "../../utils/helpers";

const InstructorRevenue = () => {
  const [balance, setBalance] = useState({ pending: [] });
   const [loading, setLoading] = useState(false);

  useEffect(() => {
    sendBalanceRequest();
  }, []);

  const sendBalanceRequest = async () => {
    const { data } = await axios.get("/api/instructor/balance");
    console.log("sendBalanceRequest - data", data);
    /**
     { "object": "balance", "available": [ { "amount": 0, "currency": "cad", "source_types": { "card": 0 } } ], "instant_available": [ { "amount": 4368, "currency": "cad", "source_types": { "card": 4368 } } ], "livemode": false, "pending": [ { "amount": 4368, "currency": "cad", "source_types": { "card": 4368 } } ] }
     */
    setBalance(data);
  };

   const handlePayoutSettings = async () => {
     try {
       setLoading(true);
       const { data } = await axios.get("/api/instructor/payout-settings");
       window.location.href = data;
     } catch (err) {
       setLoading(false);
       console.log(err);
       alert("Unable to access payout settings. Try later.");
     }
   };
  return (
    <InstructorRoute>
      <div className="container">
        <div className="row pt-2">
          <div className="col-md-8 offset-md-2 bg-light p-5">
            <h2>
              Revenue report <DollarOutlined className="float-right" />{" "}
            </h2>
            <small>
              You get paid directly from stripe to your bank account every 48
              hour
            </small>
            <hr />
            {/* {JSON.stringify(balance, null, 4)} */}
            <h4>
              Pending balance
              {balance.pending &&
                balance.pending.map((bp, i) => (
                  <span key={i} className="float-right">
                    {stripeCurrencyFormatter(bp)}
                  </span>
                ))}
            </h4>
            <small>For last 48 hours</small>
            <hr />
            <h4>
              Payouts{" "}
              {!loading ? (
                <SettingOutlined
                  className="float-right pointer"
                  onClick={handlePayoutSettings}
                />
              ) : (
                <SyncOutlined spin className="float-right pointer" />
              )}
            </h4>
            <small>
              Update your stripe account details or view previous payouts.
            </small>
          </div>
        </div>
      </div>
    </InstructorRoute>
  );
};

export default InstructorRevenue;
