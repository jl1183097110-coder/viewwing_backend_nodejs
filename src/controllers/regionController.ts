import { createRegionSchema, getSubRegionSchema, getPathSchema } from "../utils/zodschemas.js";
import type { RequestHandler } from "express";
import { sendSuccessResponse } from "../utils/response.js";
import { createRegionService, getSubRegionService, getPathService } from "../services/regionService.js";

export const createRegions: RequestHandler = async (req, res) => {
  const parsed = createRegionSchema.parse(req.body);
  const result = await createRegionService(parsed);
  return sendSuccessResponse(res, 201, result, "Region created successfully");
};

export const getSubRegions: RequestHandler = async (req, res) => {
  const parsed = getSubRegionSchema.parse(req.query);
  
  const result = await getSubRegionService({ parentId: parsed.parent_id, all: parsed.all });
  return sendSuccessResponse(res, 200, result, "Sub-regions retrieved successfully");
};

export const getRegionPath: RequestHandler = async (req, res) => {
  const parsed = getPathSchema.parse(req.params);
  const id = parsed.id;
  const result = await getPathService(id);
  return sendSuccessResponse(res, 200, result, "Region path retrieved successfully");
};
