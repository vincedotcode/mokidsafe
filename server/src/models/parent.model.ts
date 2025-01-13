import mongoose, { Schema, Document } from "mongoose";

export interface IParent extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  familyCodes: string[]; // Array of family codes
  isVerified: boolean;
  role: "parent";
  status: "active" | "inactive" | "banned";
  createdAt: Date;
  updatedAt: Date;
}

const ParentSchema: Schema<IParent> = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    firstName: {
      type: String,
      trim: true,
      minlength: [2, "firstName must be at least 2 characters long"],
    },
    
    lastName: {
      type: String,
      trim: true,
      minlength: [2, "firstName must be at least 2 characters long"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: (v: string) => {
          return /^\+?[1-9]\d{1,14}$/.test(v); // E.164 format validation
        },
        message: "Please enter a valid phone number",
      },
    },
    profilePicture: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => {
          return v === "" || /^https?:\/\/.+/.test(v); // URL validation
        },
        message: "Please enter a valid URL for the profile picture",
      },
    },
    familyCodes: {
      type: [String], // Array of strings
      validate: {
        validator: (codes: string[]) => codes.every(code => /^[A-Z0-9]{6,10}$/.test(code)), // Validate each code
        message: "Each family code must be alphanumeric and 6-10 characters long",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["parent"],
      default: "parent",
      immutable: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Parent = mongoose.model<IParent>("Parent", ParentSchema);
