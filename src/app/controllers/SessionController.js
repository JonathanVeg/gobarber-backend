import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import AuthSettings from '../../config/auth';
import File from '../models/File';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Validation failed', });
    }

    const { email, password, } = req.body;

    const user = await User.findOne({
      where: { email, },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        }
      ],
    });

    if (!user) return res.status(401).json({ message: 'User not found', });

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Password not match', });
    }

    const {
      id, name, avatar, provider,
    } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        avatar,
        provider,
      },
      token: jwt.sign({ id, }, AuthSettings.secret, {
        expiresIn: AuthSettings.expires,
      }),
    });
  }
}

export default new SessionController();
