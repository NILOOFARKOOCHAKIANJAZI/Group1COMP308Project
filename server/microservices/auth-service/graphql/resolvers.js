// auth-service/graphql/resolvers.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/config.js';

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '1d' }
  );
};

const formatUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const resolvers = {
  Query: {
    currentUser: async (_, __, context) => {
      try {
        if (!context.user) {
          return null;
        }

        const user = await User.findById(context.user.userId);
        if (!user) {
          return null;
        }

        return formatUser(user);
      } catch (error) {
        console.error('currentUser error:', error.message);
        return null;
      }
    },
  },

  Mutation: {
    register: async (_, { fullName, username, email, password, role }) => {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();

        const existingUserByEmail = await User.findOne({ email: normalizedEmail });
        if (existingUserByEmail) {
          return {
            success: false,
            message: 'An account with this email already exists.',
            user: null,
            token: null,
          };
        }

        const existingUserByUsername = await User.findOne({ username: normalizedUsername });
        if (existingUserByUsername) {
          return {
            success: false,
            message: 'This username is already taken.',
            user: null,
            token: null,
          };
        }

        const newUser = new User({
          fullName: fullName.trim(),
          username: normalizedUsername,
          email: normalizedEmail,
          password,
          role: role || 'resident',
        });

        await newUser.save();

        const token = createToken(newUser);

        return {
          success: true,
          message: 'Registration successful.',
          user: formatUser(newUser),
          token,
        };
      } catch (error) {
        console.error('register error:', error.message);

        return {
          success: false,
          message: error.message || 'Registration failed.',
          user: null,
          token: null,
        };
      }
    },

    login: async (_, { usernameOrEmail, password }, { res }) => {
      try {
        const value = usernameOrEmail.trim().toLowerCase();

        const user = await User.findOne({
          $or: [{ email: value }, { username: usernameOrEmail.trim() }],
        });

        if (!user) {
          return {
            success: false,
            message: 'User not found.',
            user: null,
            token: null,
          };
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid password.',
            user: null,
            token: null,
          };
        }

        const token = createToken(user);

        // Save token in cookie for browser-based auth
        res.cookie('token', token, {
          httpOnly: true,
          secure: false, // change to true in production with HTTPS
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        });

        return {
          success: true,
          message: 'Login successful.',
          user: formatUser(user),
          token,
        };
      } catch (error) {
        console.error('login error:', error.message);

        return {
          success: false,
          message: 'Login failed.',
          user: null,
          token: null,
        };
      }
    },

    logout: async (_, __, { res }) => {
      try {
        res.clearCookie('token', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        });

        return {
          success: true,
          message: 'Logout successful.',
        };
      } catch (error) {
        console.error('logout error:', error.message);

        return {
          success: false,
          message: 'Logout failed.',
        };
      }
    },
  },
};

export default resolvers;