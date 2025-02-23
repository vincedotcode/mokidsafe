import { Request, Response } from "express";
import mongoose from "mongoose";
import { ParentService } from "../services/parent-service";

class ParentController {
  private parentService: ParentService;

  constructor() {
    this.parentService = new ParentService();

    // Bind methods explicitly to ensure `this` context is retained
    this.createParent = this.createParent.bind(this);
    this.getAllParents = this.getAllParents.bind(this);
    this.getParentById = this.getParentById.bind(this);
    this.getParentByClerkId = this.getParentByClerkId.bind(this);
  }

  /**
   * Create a new parent
   */
  async createParent(req: Request, res: Response): Promise<void> {
    const { clerkId, firstName, lastName, email } = req.body;

    try {
      const parent = await this.parentService.createParent({ clerkId, firstName, lastName, email });
      res.status(201).json({ success: true, parent });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all parents
   */
  async getAllParents(req: Request, res: Response): Promise<void> {
    try {
      const parents = await this.parentService.getAllParents();
      res.status(200).json({ success: true, parents });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get Parent by ID
   */
  async getParentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID format" });
      return;
    }

    try {
      const parent = await this.parentService.getParentById(id);
      if (!parent) {
        res.status(404).json({ success: false, message: "Parent not found" });
        return;
      }

      res.status(200).json({ success: true, parent });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Get Parent by Clerk ID
   */
  async getParentByClerkId(req: Request, res: Response): Promise<void> {
    const { clerkId } = req.params;

    try {
      const parent = await this.parentService.getParentByClerkId(clerkId);
      if (!parent) {
        res.status(404).json({ success: false, message: "Parent not found" });
        return;
      }

      res.status(200).json({ success: true, parent });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new ParentController();
