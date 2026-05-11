import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { JWT_ISSUER, JWT_SECRET } from '@/src/utils/env';

import type { GenerateJWTOptions } from '@/src/modules/common/common.type';
import { commonHelper } from '@/src/modules/helpers';

export const compareHashPassword = (str: string, hashStr: string) => {
  if (!str || !hashStr) return false;

  return bcrypt.compareSync(str, hashStr);
};

export const checkOldPasswords = (new_password: string, oldPasswords: string[] = []) => {
  let isOldPasswordMatched = false;

  for (const password of oldPasswords) {
    if (compareHashPassword(new_password, password)) {
      isOldPasswordMatched = true;
    }
  }
  return isOldPasswordMatched;
};

export const generateHashPassword = (str: string = '') => bcrypt.hashSync(str, 10);

export const generateJWTToken = (
  payload: GenerateJWTOptions['payload'] = {},
  expiresIn: GenerateJWTOptions['expiresIn'] = '1h'
) =>
  jwt.sign(
    {
      iss: JWT_ISSUER,
      sub: payload.sub ?? commonHelper.getRandomString(),
      aud: payload.aud ?? commonHelper.getRandomString(),
      jti: payload.jti ?? commonHelper.getRandomString(),
      ...payload
    },
    JWT_SECRET,
    { expiresIn }
  );

export const decodeJWTToken = (token: string) => jwt.decode(token);

export const verifyJWTToken = (token: string) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);

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
