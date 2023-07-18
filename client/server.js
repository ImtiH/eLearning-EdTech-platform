const express = require("express"); //express comes with next.js
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const dev = process.env.NODE_ENV !== "production"; // if not production, that means we are in dev mood. 
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();
    // apply proxy in dev mode
    if (dev) {
      server.use(
        "/api", //prefix the backend route with /api, so, whenever we make a request to /api, it will be redirected to the backend server at port 8000 at http://localhost:8000/api
        // since, in the back-end we have use /api as prefix for all the routes, we are using /api as prefix here as well. 
        //=> in the production mode, we will not use the proxy, we will use the absolute url of the backend server. meaning, we will use simply "/register" and it will hit "http://www.websitename.com/register" to hit the register route in the backend. Here, in the dev mode, we are using the proxy, so, we will use "/api/register" to hit the register route in the backend, though /api/register hits the localhost:3000/api/register, but, the proxy will redirect it to the backend server at port 8000 at http://localhost:8000/api/register
        createProxyMiddleware({
          target: "http://localhost:8000",
          changeOrigin: true,
        })
      ); 
    }

    server.all("*", (req, res) => {
      return handle(req, res); //handle all the requests using express
    });

    server.listen(3000, (err) => {
      //running the server on port 3000
      if (err) throw err;
      console.log("> Ready on http://localhost:8000");
    });
  })
  .catch((err) => {
    console.log("Error", err);
  });
