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
      stopAtFirstError: true,
    });
  }

  private static formatErrors(errors: ValidationError[]): any {
    let formatted: Record<string, any> = {};

    errors.forEach((error) => {
      if (error.children && error.children.length) {
        if (Array.isArray(formatted[error.property])) {
          formatted[error.property].push(this.formatErrors(error.children));
        } else if (/^\d+$/.test(error.property)) {
          // Jika properti adalah angka, artinya bagian dari array
          const index = Number(error.property);
          if (!Array.isArray(formatted)) Object.assign(formatted, []);
          formatted[index] = this.formatErrors(error.children);
        } else {
          formatted[error.property] = this.formatErrors(error.children);
        }
      } else {
        formatted[error.property] = error.constraints
          ? Object.values(error.constraints)[0]
          : "Invalid input";
      }
    });

    // Jika ada properti yang numerik (array), ubah object jadi array
    Object.keys(formatted).forEach((key) => {
      if (/^\d+$/.test(key)) {
        const arrayErrors = Object.keys(formatted)
          .filter((k) => /^\d+$/.test(k))
          .map((k) => formatted[k]);

        formatted = arrayErrors;
      }
    });

    return formatted;
  }
}
