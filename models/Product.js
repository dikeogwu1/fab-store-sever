const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide product name"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
      maxlength: [1000, "Description can not be more than 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    offer: {
      type: Boolean,
      default: false,
      required: [true, "Please indicate if the product has an offer"],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    sizes: {
      type: [{ id: Number, size: String }],
      default: [{ id: 1, size: "XL" }],
      required: [true, "Please provide product sizes"],
    },
    colors: {
      type: [{ id: Number, name: String, hexColor: String }],
      default: [{ id: 1, name: "Black", hexColor: "#000" }],
      required: [true, "Please provide product colors"],
    },
    images: {
      type: [
        {
          id: Number,
          img: String,
        },
      ],
      required: [true, "Please provide product images"],
    },
    categories: {
      type: String,
      required: [true, "Please provide product category"],
    },
    collections: {
      type: String,
      default: "All collections",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
  // match: { rating: 4 },
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
