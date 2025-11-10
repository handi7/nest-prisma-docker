import { Injectable, ValidationPipe, BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = CustomValidationPipe.formatErrors(errors);

        return new BadRequestException({
          message: "Validation error",
          validation: formattedErrors,
        });
      },
      stopAtFirstError: false,
    });
  }

  private static formatErrors(
    errors: ValidationError[],
    parentPath = "",
  ): { field: string; messages: string[] }[] {
    const result: { field: string; messages: string[] }[] = [];

    errors.forEach((error) => {
      const isNumeric = /^\d+$/.test(error.property);
      const fieldPath = parentPath
        ? `${parentPath}.${isNumeric ? error.property : error.property}`
        : error.property;

      if (error.children && error.children.length > 0) {
        // Rekursif untuk nested (object / array)
        result.push(...this.formatErrors(error.children, fieldPath));
      } else if (error.constraints) {
        // Ambil semua pesan error dari constraint
        const messages = Object.values(error.constraints);
        result.push({ field: fieldPath, messages });
      } else {
        // Default fallback
        result.push({ field: fieldPath, messages: ["Invalid input"] });
      }
    });

    return result;
  }
}
