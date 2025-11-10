export const parser = {
  parseBoolean(value: string): boolean {
    const bools = { true: true, false: false };
    return bools?.[value] || false;
  },
};
