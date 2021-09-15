import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import Controller from './controller/controller.abstract';

export default class ExpressApp {
    public app: express.Application;

    constructor(...controllers: Controller[]) {
        this.app = express();
        this.initializeMiddleware();
        this.initializeControllers(controllers);
        this.app.get('/health_check', (_: Request, res: Response) => {
            res.send('OK');
        });
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use(controller.path, controller.router);
        });
    }

    private initializeMiddleware() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));
    }
}
