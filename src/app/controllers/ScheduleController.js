import { endOfDay, parseISO, startOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    const checkUserProvider = await User.findOne({ where: { id: req.userId, provider: true, }, });

    if (!checkUserProvider) {
      return res.status(401).json({ message: 'User must be a provider', });
    }

    const { page = 1, date, } = req.query;

    const limit = 3;

    const parsedDate = parseISO(date);

    const whereClause = {
      provider_id: req.userId,
      canceled_at: null,
    };

    if (date) {
      whereClause.date = {
        [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
      };
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      limit,
      offset: (page - 1) * limit,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            }
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            }
          ],
        }
      ],
      attributes: ['id', 'date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
