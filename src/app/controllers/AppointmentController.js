/* eslint-disable object-curly-newline */
/* eslint-disable no-trailing-spaces */
import { format, isBefore, parseISO, startOfHour, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';
import Notification from '../schemas/notifications';

class AppointmentController {
  async index(req, res) {
    const { page = 1, } = req.query;

    const limit = 3;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
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
        }
      ],
      attributes: ['id', 'date', 'past', 'cancelable'],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ message: 'Validation error', });
    }

    const { provider_id: providerId, date, } = req.body;

    const isProvider = await User.findOne({ where: { id: providerId, provider: true, }, });

    if (!isProvider) {
      return res.status(401).json({ message: 'You can only create appointments with providers', });
    }

    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(401).json({ message: 'Past date is not allowed', });
    }

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id: providerId,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(401).json({ message: 'Date is not available', });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id: providerId,
      date,
    });

    // notify provider
    const user = await User.findByPk(req.userId);

    const formattedDate = format(hourStart, "dd 'de' MMMM', às' H:mm'h'", { locale: pt, });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para dia ${formattedDate}`,
      user: providerId,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'provider', attributes: ['name', 'email'], },
        { model: User, as: 'user', attributes: ['name', 'email'], }
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appoitment not found', });
    }

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({ message: 'You cannot cancel this appoitment', });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({ message: 'You cannot cancel this appoitment at this time', });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, { appointment, });

    return res.json(appointment);
  }
}

export default new AppointmentController();
