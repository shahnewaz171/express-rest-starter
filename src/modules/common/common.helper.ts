import { find, isFinite as isFiniteNumber } from 'lodash-es';
import validator from 'validator';

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
  const characters = '0123456789';

  let result = '';
  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

export const getRandomString = () => crypto.randomUUID();

export const validateDomain = (domain: string) => validator.isFQDN(domain);

export const validateEmail = (email = '') => validator.isEmail(email);

export const validateUUID = (uuid = '') => validator.isUUID(uuid);

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
  return !!permission?.can_do_the_action;
};
