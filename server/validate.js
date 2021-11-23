const yup = require("yup");

module.exports =
  ({ shape, path = "body" }) =>
  async (req, res, next) => {
    const schema = yup.object().shape(shape);

    try {
      const validData = await schema.validate(req[path || "body"]);
      req.validData = validData;
      return next();
    } catch (error) {
      console.error(error);
      res.status(400).send({ errors: error.errors });
    }
  };
