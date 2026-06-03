import { randomInt } from 'node:crypto';
import find from 'lodash/find';
import isFiniteNumber from 'lodash/isFinite';
import validator from 'validator';

import { CustomError } from '@/src/utils/error';

import type { QueryOptions, ValidateUserPermissionParams } from '@/src/modules/common/common.type';

export const getCommonOptions = () => ({
  limit: 50,
  offset: 0,
  order: [['created_at', 'desc']]
});

export const getFirstLetterUpperCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const getOptionsFromQuery = (query: QueryOptions) => {
  const limit = Number(query.limit);
  const offset = Number(query.offset);

  return {
    limit: isFiniteNumber(limit) ? limit : 50,
    offset: isFiniteNumber(offset) ? offset : 0,
    order: query.order ? JSON.parse(query.order as string) : [['created_at', 'desc']]
  };
};

export const getRandomNumber = (length: number) => {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += randomInt(0, 10).toString();
  }

  return result;
};

export const getRandomString = () => crypto.randomUUID();

export const validateDomain = (domain: string) => validator.isFQDN(domain);

export const validateEmail = (email: string) => validator.isEmail(email);

export const validateUUID = (uuid: string) => validator.isUUID(uuid);

export const validatePassword = (password: string) =>
  validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });

export const validatePhoneNumber = (phoneNumber: string) => validator.isMobilePhone(phoneNumber);

export const validateURL = (input: string) => validator.isURL(input);

export const validateUserPermission = ({
  action,
  module,
  permissions = {}
}: ValidateUserPermissionParams) => {
  const permission = find(permissions?.[module] || [], (perm) => perm?.action === action);

  if (!permission?.can_do_the_action) throw new CustomError(403, 'PERMISSION_DENIED');

  return permission.can_do_the_action;
};
