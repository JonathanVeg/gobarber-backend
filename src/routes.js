import { Router } from 'express';
import multer from 'multer';

import AppointmentController from './app/controllers/AppointmentController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import MulterConfig from './config/multer';

const routes = new Router();

const upload = multer(MulterConfig);

routes.get('/', async (req, res) => {
  const json = {
    success: true,
    message: 'Node server is running in port 3333',
  };

  res.json(json);
});

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.post('/files', upload.single('file'), FileController.store);
routes.post('/appointments', AppointmentController.store);
routes.get('/providers', ProviderController.index);

export default routes;
