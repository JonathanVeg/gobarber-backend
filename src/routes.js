import { Router } from 'express';
import multer from 'multer';

import AppointmentController from './app/controllers/AppointmentController';
import AvailableController from './app/controllers/AvailableController';
import FileController from './app/controllers/FileController';
import NotificationsController from './app/controllers/NotificationsController';
import ProviderController from './app/controllers/ProviderController';
import ScheduleController from './app/controllers/ScheduleController';
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
routes.get('/appointments', AppointmentController.index);
routes.get('/schedule', ScheduleController.index);
routes.post('/appointments', AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);
routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);
routes.get('/notifications', NotificationsController.index);
routes.put('/notifications/:id', NotificationsController.update);

export default routes;
