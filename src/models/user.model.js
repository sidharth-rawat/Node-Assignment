import { Schema, model } from "mongoose"

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const UserModel = model("Users", usersSchema)
