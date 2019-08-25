import { isBefore, parseISO, startOfHour } from 'date-fns';
import * as Yup from 'yup';

import Appointment from '../models/Appointment';
import User from '../models/User';

class AppointmentController {
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

    return res.json(appointment);
  }
}

export default new AppointmentController();
