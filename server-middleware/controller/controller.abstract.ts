import {NextFunction, Request, Response, Router} from 'express';

abstract class Controller {
    public abstract path: string;
    public abstract router: Router;

    protected handleRejections(call: (req: Request, res: Response, next?: NextFunction) => Promise<any>) {
        return (req: Request, res: Response, next: NextFunction) => {
            return call(req, res, next).catch(next);
        };
    }
}

export default Controller;
