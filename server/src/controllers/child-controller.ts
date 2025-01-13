import { Request, Response } from "express";
import mongoose from "mongoose";
import ChildService from "../services/child-service";

class ChildController {
  /**
   * Authenticate Child by Family Code
   */
  async authenticateChild(req: Request, res: Response) {
    const { familyCode } = req.body;

    try {
      const child = await ChildService.authenticateChildByFamilyCode(familyCode);
      res.status(200).json({ success: true, child });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Create Child and Update Parent Family Codes
   */
  async createChild(req: Request, res: Response) {
    const { name, age, profilePicture, familyCode, parentId, emergencyContacts } = req.body;

    try {
      const child = await ChildService.createChild({
        name,
        age,
        profilePicture,
        familyCode,
        parentId,
        emergencyContacts,
      });

      res.status(201).json({ success: true, child });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getChildrenByParentId(req: Request, res: Response) {
    const { parentId } = req.params;

    try {
      const children = await ChildService.getChildrenByParentId(parentId);
      res.status(200).json({ success: true, children });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new ChildController();
