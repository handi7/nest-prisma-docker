/**
 * Applies method-level Swagger decorators from inside a parameter decorator.
 *
 * The schema is known at the parameter (@ZodBody, @ZodQuery, @PrismaInclude), but @ApiBody and
 * @ApiQuery are method decorators. Wiring both from a single call site is the whole point: the
 * documented shape and the validated shape come from the same variable, so they cannot drift.
 */
export function withMethodDocs(
  parameter: ParameterDecorator,
  docs: MethodDecorator[],
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    parameter(target, propertyKey, parameterIndex);

    // Constructor parameters have no property key and nothing to document.
    if (propertyKey === undefined) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);

    if (!descriptor) {
      return;
    }

    for (const doc of docs) {
      doc(target, propertyKey, descriptor);
    }
  };
}
