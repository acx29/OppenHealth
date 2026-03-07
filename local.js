import app from "./server.js";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:3000`);
});