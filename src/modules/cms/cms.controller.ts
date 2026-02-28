import { Request, Response } from 'express';
import { CmsService } from './cms.service';

const cmsService = new CmsService();

export class CmsController {
    async getHome(req: Request, res: Response): Promise<void> {
        try {
            const homeContent = await cmsService.getHomeContent();
            res.status(200).json(homeContent);
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }

    async updateHome(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            const updatedContent = await cmsService.updateHomeContent(data);
            res.status(200).json({ message: 'Home content updated successfully', data: updatedContent });
        } catch (error: any) {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
}
