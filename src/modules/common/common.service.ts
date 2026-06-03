import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import env from '@/src/utils/env';

import * as commonHelper from '@/src/modules/common/common.helper';
import type { GenerateJWTOptions } from '@/src/modules/common/common.type';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const compareHashPassword = async (str: string, hashStr: string) => {
  if (!str || !hashStr) return false;

  return await bcrypt.compare(str, hashStr);
};

export const checkOldPasswords = async (new_password: string, oldPasswords: string[] = []) => {
  for (const password of oldPasswords) {
    const isValid = await compareHashPassword(new_password, password);

    if (isValid) {
      return true;
    }
  }
  return false;
};

export const generateHashPassword = async (str: string = '') => await bcrypt.hash(str, 10);

export const generateJWTToken = (
  payload: GenerateJWTOptions['payload'] = {},
  expiresIn: GenerateJWTOptions['expiresIn'] = '1h'
) =>
  jwt.sign(
    {
      iss: env.JWT_ISSUER,
      sub: payload.sub ?? commonHelper.getRandomString(),
      aud: payload.aud ?? commonHelper.getRandomString(),
      jti: payload.jti ?? commonHelper.getRandomString(),
      ...payload
    },
    env.JWT_SECRET,
    { expiresIn }
  );

export const decodeJWTToken = (token: string) => jwt.decode(token) as JwtPayload;

export const verifyJWTToken = (token: string) => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { issuer: env.JWT_ISSUER });

    return { message: 'TOKEN_IS_VERIFIED', payload, success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message.replaceAll(' ', '_').toUpperCase() : 'UNKNOWN_ERROR';

    return {
      message,
      success: false
    };
  }
};
