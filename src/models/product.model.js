import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    default: 18,
  },
});

const quotationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users", // Reference to the user model
    },
    date: {
      type: Date,
      default: Date.now,
    },
    products: [productSchema], // Array of products
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const QuotationModel = model("Quotation", quotationSchema);
