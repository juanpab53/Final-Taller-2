export class Token {
  constructor({ value, type }) {
    this.value = value;
    this.type = type;
  }

  toString() {
    return this.value;
  }
}
