const express = require("express");
const yup = require("yup");
const { json } = require("body-parser");
const validate = require("./validate");
const app = express();

app.use(json());
app.use(express.static("../build"));

const data = {
  target: 18,
  sensor: {
    previous: 18,
    current: 18.2,
    changedAt: Date.now(),
    updatedAt: Date.now(),
    error: undefined,
  },
  relay: {
    previous: true,
    current: false,
    changedAt: Date.now(),
    updatedAt: Date.now(),
    error: undefined,
  },
};

function updateValue(key, value) {
  data[key].updatedAt = Date.now();
  data[key].error = undefined;
  if (data[key].current !== value) {
    data[key].previous = data[key].current;
    data[key].current = value;
    data[key].changedAt = Date.now();
  }
}

app.get("/api", function (_, res) {
  res.json({ ...data, serverTime: Date.now() });
});

app.post(
  "/api",
  validate({ shape: { target: yup.number().required().min(16).max(20) } }),
  function (_, res) {
    res.sendStatus(204);
  }
);

app.listen(3001);
