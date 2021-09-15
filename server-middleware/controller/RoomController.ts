import axios from 'axios';
import {Request, Response, Router} from 'express';
import * as process from 'process';
import Controller from './controller.abstract';

export default class RoomController extends Controller {
    path: string = '/api/rooms';
    router: Router = Router();

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('', super.handleRejections(this.postRooms));
    }

    private postRooms = async (req: Request, res: Response) => {
        const apiRes = await axios.post(`${process.env.NUXT_PUBLIC_WEBRTC_URL}/rooms`, req.body);
        const status = apiRes.status;
        const data = await apiRes.data;
        return res.status(status).send(data);
    };
}
