import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { config } from '../config/config.js'

// Constants for cookie management WITH THE MAX_AGE SET TO 24 HOURS
const COOKIE_NAME = 'token'
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000

const getCookieOptions = () => ({
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: COOKIE_MAX_AGE,
})

// Create JWT token with user info
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '1d' },
  )
}

// Format user object for API response
const formatUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
})

const normalizeRoleForPublicRegistration = () => 'resident'

const resolvers = {
  Query: {
    // Get current user based on JWT token in the request cookies
    currentUser: async (_, __, context) => {
      try {
        if (!context.user?.userId) {
          return null
        }

        const user = await User.findById(context.user.userId)
        if (!user) {
          return null
        }

        return formatUser(user)
      } catch (error) {
        console.error('currentUser error:', error.message)
        return null
      }
    },
  },

  Mutation: {
    // Register a new user with full name, unique username,unique email, and password
    register: async (_, { fullName, username, email, password }) => {
      try {
        const normalizedEmail = email.trim().toLowerCase()
        const normalizedUsername = username.trim()
        const normalizedFullName = fullName.trim()
        const safeRole = normalizeRoleForPublicRegistration()

        const existingUserByEmail = await User.findOne({ email: normalizedEmail })
        if (existingUserByEmail) {
          return {
            success: false,
            message: 'An account with this email already exists.',
            user: null,
            token: null,
          }
        }

        const existingUserByUsername = await User.findOne({ username: normalizedUsername })
        if (existingUserByUsername) {
          return {
            success: false,
            message: 'This username is already taken.',
            user: null,
            token: null,
          }
        }

        const newUser = new User({
          fullName: normalizedFullName,
          username: normalizedUsername,
          email: normalizedEmail,
          password,
          role: safeRole,
        })

        await newUser.save()

        return {
          success: true,
          message: 'Registration successful. Please log in.',
          user: formatUser(newUser),
          token: null,
        }
      } catch (error) {
        console.error('register error:', error.message)

        return {
          success: false,
          message: error.message || 'Registration failed.',
          user: null,
          token: null,
        }
      }
    },

    // Login user with username or email and password, return JWT token in HTTP-only cookie
    login: async (_, { usernameOrEmail, password }, { res }) => {
      try {
        const rawValue = usernameOrEmail.trim()
        const normalizedValue = rawValue.toLowerCase()

        const user = await User.findOne({
          $or: [{ email: normalizedValue }, { username: rawValue }],
        })

        if (!user) {
          return {
            success: false,
            message: 'User not found.',
            user: null,
            token: null,
          }
        }

        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid password.',
            user: null,
            token: null,
          }
        }

        const token = createToken(user)

        res.cookie(COOKIE_NAME, token, getCookieOptions())

        return {
          success: true,
          message: 'Login successful.',
          user: formatUser(user),
          token: null,
        }
      } catch (error) {
        console.error('login error:', error.message)

        return {
          success: false,
          message: 'Login failed.',
          user: null,
          token: null,
        }
      }
    },

    // Logout user by clearing the JWT token cookie
    logout: async (_, __, { res }) => {
      try {
        res.clearCookie(COOKIE_NAME, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
        })

        return {
          success: true,
          message: 'Logout successful.',
        }
      } catch (error) {
        console.error('logout error:', error.message)

        return {
          success: false,
          message: 'Logout failed.',
        }
      }
    },
  },
}

export default resolvers