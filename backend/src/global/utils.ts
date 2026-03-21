export function pascalToKebab(str: string): string {
  return str
    // Look for a lowercase letter followed immediately by an uppercase letter.
    // Insert a hyphen between them
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Convert the entire string to lowercase
    .toLowerCase();
}