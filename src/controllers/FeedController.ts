import { Request, Response } from 'express';
import Controller from './Controller';
import FeedService from '../services/FeedService';

export default class FeedController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/feeds', this.getAll.bind(this));
    }

    private async getAll(req: Request, res: Response) {
        const feedService = new FeedService(this.conn);
        const result = await feedService.findAll();
        res.send(result);
        return
    }
}