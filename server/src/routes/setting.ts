import { Router } from 'express'
import Setting from '../models/setting'
import { authMiddleware, roleMiddleware } from '../middleware/auth'
import { UserRole } from '../models/user'
import { AppError } from '../middleware/error'
import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

const router = Router()

// Get current settings
router.get('/', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get settings or create default if not exists
    let settings = await Setting.findOne().lean()
    
    if (!settings) {
      const defaultSettings = new Setting()
      await defaultSettings.save()
      settings = defaultSettings.toJSON()
    }
    
    // Don't send the actual token for security
    const response = {
      ...settings,
      aiToken: settings.aiToken ? '••••••••' : ''
    }
    
    res.status(200).json(response)
  } catch (error) {
    next(new AppError('Failed to fetch settings', 500))
  }
})

// Update general settings
router.post('/general', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tokenExpiry } = req.body
    
    // Validate
    if (tokenExpiry !== undefined && (tokenExpiry < 1 || tokenExpiry > 720)) {
      return next(new AppError('Token expiry must be between 1 and 720 hours', 400))
    }
    
    // Get settings or create default if not exists
    let settings = await Setting.findOne()
    
    if (!settings) {
      settings = new Setting()
    }
    
    // Update settings
    if (tokenExpiry !== undefined) {
      settings.tokenExpiry = tokenExpiry
    }
    
    await settings.save()
    
    res.status(200).json({
      message: 'General settings updated successfully',
      settings: {
        tokenExpiry: settings.tokenExpiry
      }
    })
  } catch (error) {
    next(new AppError('Failed to update general settings', 500))
  }
})

// Update AI settings
router.post('/ai', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { aiEndpoint, aiToken, aiModel } = req.body
    
    // Get settings or create default if not exists
    let settings = await Setting.findOne()
    
    if (!settings) {
      settings = new Setting()
    }
    
    // Update settings
    if (aiEndpoint) {
      settings.aiEndpoint = aiEndpoint
    }
    
    if (aiToken) {
      // In a real app, you would encrypt this token
      settings.aiToken = aiToken
    }
    
    if (aiModel) {
      settings.aiModel = aiModel
    }
    
    await settings.save()
    
    res.status(200).json({
      message: 'AI settings updated successfully',
      settings: {
        aiEndpoint: settings.aiEndpoint,
        aiModel: settings.aiModel,
        aiToken: settings.aiToken ? '••••••••' : ''
      }
    })
  } catch (error) {
    next(new AppError('Failed to update AI settings', 500))
  }
})

// Test AI connection
router.post('/test-ai', authMiddleware, roleMiddleware([UserRole.LECTURER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 获取设置
    const { aiEndpoint, aiToken, aiModel } = req.body;
    
    // 如果请求中没有提供，则使用数据库中的设置
    let settings = await Setting.findOne();
    const endpoint = aiEndpoint || (settings?.aiEndpoint || '');
    const token = aiToken || (settings?.aiToken || '');
    
    if (!endpoint || !token) {
      return next(new AppError('AI endpoint and token are required', 400));
    }
    
    // 构建测试 URL (假设是 OpenAI 格式的 API)
    const testUrl = `${endpoint}/models`;
    
    try {
      // 发送实际请求测试连接
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API responded with status: ${response.status}, message: ${errorText}`);
      }
      
      res.status(200).json({
        message: 'AI connection test successful'
      });
    } catch (error: any) {
      console.error('AI connection test error:', error);
      return next(new AppError(`AI connection test failed: ${error.message}`, 400));
    }
  } catch (error: any) {
    next(new AppError('AI connection test failed', 500));
  }
});

export default router 