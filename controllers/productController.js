const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProduct = async (req, res) => {
  const {
    featured,
    categories,
    collections,
    sort,
    name,
    fields,
    numericFilters,
    pricesGreaterThan,
  } = req.query;
  const queryObject = {};

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }

  if (categories) {
    queryObject.categories = { $regex: categories, $options: "i" };
  }

  if (collections) {
    queryObject.collections = { $regex: collections, $options: "i" };
  }

  function decodeHtmlEntities(str) {
    return str.replace(/&lt;/g, "<");
  }

  let nunumericNumber = numericFilters;

  if (nunumericNumber?.includes("&lt;")) {
    nunumericNumber = decodeHtmlEntities(numericFilters);
  }

  if (nunumericNumber) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = nunumericNumber.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = {
          $gte: pricesGreaterThan ? Number(pricesGreaterThan) : 0,
          [operator]: Number(value),
        };
      }
    });
  }

  let result = Product.find(queryObject);

  // sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;
  res.status(200).json({ products, nbHits: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  if (!productId) {
    throw new CustomError.NotFoundError(
      `No product with the id of ${productId}`
    );
  }

  const product = await Product.findOne({ _id: productId }).populate("reviews");
  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  if (!productId) {
    throw new CustomError.NotFoundError(
      `No product with the id of ${productId}`
    );
  }

  const product = await Product.findOne({ _id: productId });
  await product.remove();

  res.status(StatusCodes.OK).json({ msg: "Success! product deleted" });
};

const uploadProductImage = async (req, res) => {
  const productImage = req.files;

  if (!productImage) {
    throw new CustomError.BadRequestError("No image uploaded.");
  }

  const image = productImage.image;

  if (!image.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload an image.");
  }

  const maxSize = 1000 * 1000;

  if (image.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload an image less than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${image.name}`
  );
  image.mv(imagePath);

  res.status(StatusCodes.OK).json({ image: `/uploads/${image.name}` });
};

module.exports = {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
