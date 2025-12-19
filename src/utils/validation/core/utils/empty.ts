export function isEmpty(value: any): boolean {
  return (
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      value !== null &&
      Object.keys(value).length === 0)
  );
}
