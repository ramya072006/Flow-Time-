import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendSuccess, sendError, sendCreated } from '../utils/apiResponse';

describe('API Response Utilities', () => {
  let mockRes: any;

  beforeEach(() => {
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('sendSuccess', () => {
    it('should return 200 with default message and success status', () => {
      sendSuccess(mockRes, { foo: 'bar' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { foo: 'bar' },
        message: 'Success',
      });
    });

    it('should include pagination meta when provided', () => {
      const pagination = { page: 1, limit: 10, total: 50, totalPages: 5, hasNext: true, hasPrev: false };
      sendSuccess(mockRes, [], 'Data retrieved', 200, pagination);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: 'Data retrieved',
        pagination,
      });
    });
  });

  describe('sendError', () => {
    it('should return default status 400 with error message', () => {
      sendError(mockRes, 'Invalid request');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid request',
      });
    });

    it('should include error details when provided', () => {
      const errors = { email: ['Invalid format'] };
      sendError(mockRes, 'Validation failed', 422, errors);
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors,
      });
    });
  });

  describe('sendCreated', () => {
    it('should return 201 status with created message', () => {
      sendCreated(mockRes, { id: '123' }, 'Item created');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { id: '123' },
        message: 'Item created',
      });
    });
  });
});
