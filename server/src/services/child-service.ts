import { Request, Response } from "express";
import mongoose from "mongoose";
import { Parent } from "../models/parent.model"; // Update path as per your project structure
import { Child } from "../models/child.model";

class ChildService {
  /**
   * Authenticate Child by Family Code
   */
  async authenticateChildByFamilyCode(familyCode: string) {
    const child = await Child.findOne({ familyCode });
    if (!child) {
      throw new Error("Invalid family code");
    }
    return child;
  }

  /**
   * Create a Child and Update Parent Family Codes
   */
  async createChild(data: {
    name: string;
    age: number;
    profilePicture?: string;
    familyCode: string;
    parentId: string;
    emergencyContacts: {
      name: string;
      phoneNumber: string;
      relationship: string;
    }[];
  }) {
    const { name, age, profilePicture, familyCode, parentId, emergencyContacts } = data;


    // Check if the family code exists for the parent
    const parent = await Parent.findById( parentId );
    if (!parent) {
      throw new Error("Parent not found");
    }

    if (parent.familyCodes.includes(familyCode)) {
      throw new Error("Invalid family code for this parent");
    }

    // Create the child
    const child = await Child.create({
      name,
      age,
      profilePicture,
      familyCode,
      parentId,
      emergencyContacts,
    });

    // Update parent's familyCodes if not already added
    if (!parent.familyCodes.includes(familyCode)) {
      parent.familyCodes.push(familyCode);
      await parent.save();
    }

    return child;
  }

/**
   * Get child by parent 
   */

  async getChildrenByParentId(parentId: string) {
    const children = await Child.find({ parentId });
    if (!children) {
      throw new Error("No children found for the specified parent.");
    }
    return children;
  }
}

export default new ChildService();
