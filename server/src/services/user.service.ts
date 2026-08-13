import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../lib/prisma';

interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const generateToken = (user: { id: number; email: string }) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ userId: user.id }, secret, {
    expiresIn: '7d',
  });
};

export const registerUser = async ({ email, password, name }: RegisterUserInput) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const normalizedEmail = normalizeEmail(email);

  if (password.length < 6) {
    throw new Error('Password must contain at least 6 characters');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name: name?.trim() || null,
    },
  });

  const { password: _password, ...safeUser } = user;
  const token = generateToken({ id: user.id, email: user.email });

  return {
    ...safeUser,
    token,
  };
};

export const loginUser = async ({ email, password }: LoginUserInput) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const { password: _password, ...safeUser } = user;
  const token = generateToken({ id: user.id, email: user.email });

  return {
    ...safeUser,
    token,
  };
};
