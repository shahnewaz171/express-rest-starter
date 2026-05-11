import {
  find,
  forEach,
  isBoolean,
  isEmpty,
  isFinite as isFiniteNumber,
  isNumber,
  join,
  map,
  omit,
  size
} from 'lodash';
import validator from 'validator';

// Utils
import { CustomError } from '@/src/utils/error';

import type { QueryOptions, ValidateUserPermissionParams } from '@/src/modules/common/common.type';

export const getCommonOptions = () => ({ limit: 50, offset: 0, order: [['created_at', 'desc']] });

export const getOptionsFromQuery = (query: QueryOptions) => {
  const limit = Number(query.limit);
  const offset = Number(query.offset);

  return {
    limit: isFiniteNumber(limit) ? limit : 50,
    offset: isFiniteNumber(offset) ? offset : 0,
    order: query.order ? JSON.parse(query.order) : [['created_at', 'desc']]
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

export const validateDomain = (domain = '') => validator.isFQDN(domain);

export const validateEmail = (email = '') => validator.isEmail(email);

export const validateProps = (fields = [], body = {}) => {
  const notAllowedFields: string[] = Object.keys(omit(body, map(fields, 'field')));
  if (size(notAllowedFields)) {
    throw new Error(`${join(notAllowedFields, '_AND_')?.toUpperCase?.()}_NOT_ALLOWED`);
  }

  const invalidFields: string[] = [];
  const missingFields: string[] = [];
  forEach(fields, ({ field, required, type }) => {
    if (typeof body[field] !== 'undefined' && typeof body[field] !== type) {
      invalidFields.push(field);
    }
    if (required && !isBoolean(body[field]) && isEmpty(body[field])) {
      missingFields.push(field);
    }
  });

  if (size(invalidFields)) {
    throw new Error(`INVALID_TYPE_OF_${join(invalidFields, '_AND_')?.toUpperCase?.()}`);
  }
  if (size(missingFields)) {
    throw new Error(`MISSING_${join(missingFields, '_AND_')?.toUpperCase?.()}`);
  }
};

export const validateRequiredProps = (
  requiredFields: string[] = [],
  body: Record<string, unknown> = {}
) => {
  const missingFields: string[] = [];

  for (let i = 0; i < requiredFields?.length; i += 1) {
    const field = requiredFields[i];

    if (field && isEmpty(body[field]) && !isNumber(body[field]) && !isBoolean(body[field])) {
      missingFields.push(field);
    }
  }

  if (size(missingFields)) {
    throw new CustomError(400, `MISSING_${join(missingFields, '_AND_')?.toUpperCase?.()}`);
  }
};

export const validateURL = (input = '') => validator.isURL(input);

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

export const validateUserPermission = ({
  action,
  module,
  permissions = {}
}: ValidateUserPermissionParams) => {
  const permission = find(permissions?.[module] || [], (perm) => perm?.action === action);
  return !!permission?.can_do_the_action;
};
