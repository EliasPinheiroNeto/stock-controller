import { Request, Response } from 'express';
import Controller from './Controller';
import FeedService from '../services/FeedService';
import RequestService from '../services/RequestService';
import ApplicationError from '../applicationError';

export default class FeedController extends Controller {
    protected assignRoutes(): void {
        this.router.get('/feeds', this.getAll.bind(this));
    }

    private async getAll(req: Request, res: Response) {
        const feedService = new FeedService(this.conn);

        try {
            const data = RequestService.validateAuthHeader(req.headers.authorization);

            if (data.employeeId) {
                throw new ApplicationError('Unauthorized', {
                    status: 401,
                    errorCode: 'UNAUTHORIZED',
                    message: 'Você não tem permissão para acessar este recurso'
                });
            }

            const result = await feedService.findByUserID(data.userId);
            res.send(result);
            return
        } catch (err) {
            this.errorHandler(err, res);
        }
    }
}