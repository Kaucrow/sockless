export class Management {
  private number: number = 0;

  public constructor() {}

  public update(mult: number) {
    console.log(`Updating user ${this.number}...`);
    const result = this.number * mult;
    console.log(`User * Mult: ${result}...`);
    this.number += 1;
    return result;
  }
}