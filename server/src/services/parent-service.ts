// src/services/ParentService.ts
import { IParent, Parent } from "../models/parent.model";

interface CreateParentInput {
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class ParentService {

  async createParent(data: CreateParentInput) {
    try {
      const existingParent = await Parent.findOne({ clerkId: data.clerkId });
      if (existingParent) {
        console.log("Parent already exists");
        return existingParent;
      }

      const parent = await Parent.create(data);
      console.log("Parent created:", parent);
      return parent;
    } catch (error: any) {
      console.error("Error creating parent:", error.message);
      throw error;
    }
  }

  async getAllParents(): Promise<IParent[]> {
    try {
      const parents = await Parent.find();
      return parents;
    } catch (error: any) {
      console.error("Error fetching parents:", error.message);
      throw error;
    }
  }

  // Get parent by ID
  async getParentById(id: string): Promise<IParent | null> {
    try {
      const parent = await Parent.findById(id);
      if (!parent) {
        console.log(`Parent with ID ${id} not found.`);
        return null;
      }
      console.log("Parent found:", parent);
      return parent;
    } catch (error: any) {
      console.error(`Error fetching parent with ID ${id}:`, error.message);
      throw error;
    }
  }


   // Get parent by clerk id
   async getParentByClerkId(clerkId: string): Promise<IParent | null> {
    try {
      const parent = await Parent.findOne({ clerkId });
      if (!parent) {
        console.log(`Parent with clerkId ${clerkId} not found.`);
        return null;
      }
      return parent;
    } catch (error: any) {
      console.error(`Error fetching parent with clerkId ${clerkId}:`, error.message);
      throw error;
    }
  }
}
