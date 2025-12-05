import { BadRequestException } from "@nestjs/common";

export interface ValidationField {
  field: string;
  messages: string[];
}

export function parseValidationErrors<T extends Record<string, any>>(
  errors: Partial<Record<keyof T, string[]>>,
) {
  const validation: ValidationField[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    validation.push({ field, messages: messages || [] });
  }

  return validation;
}

export function buildValidationError<T extends Record<string, any>>(
  message: string,
  errors: Partial<Record<keyof T, string[]>>,
): BadRequestException {
  return new BadRequestException({
    message,
    validation: parseValidationErrors<T>(errors),
  });
}

export function buildOneValidationError<T extends Record<string, any>>(
  field: keyof T,
  message: string,
  generalMessage?: string,
): BadRequestException {
  const errors: Partial<Record<keyof T, string[]>> = {};
  errors[field] = [message];

  return buildValidationError<T>(generalMessage || message, errors);
}
