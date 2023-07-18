import "antd/dist/antd.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopNav from "../components/TopNav";
import { Provider } from "../context";
import "./../public/css/styles.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Provider>
        <ToastContainer position="top-center" />
        <TopNav />
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default MyApp;
