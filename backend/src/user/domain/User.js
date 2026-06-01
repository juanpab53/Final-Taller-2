import { Email } from "./Email.js";

export class User {
  constructor({ id, name = "", email, tel = "", role = "CLIENT", passwordHash }) {
    if (!email) {
      throw new Error("Email es requerido para crear un usuario.");
    }

    this.id = id;
    this.name = name || "";
    this.email = email instanceof Email ? email.toString() : new Email(email).toString();
    this.tel = tel || "";
    this.role = role;
    this.passwordHash = passwordHash;
  }

  static create({ name, email, tel, role = "CLIENT", passwordHash }) {
    return new User({ name, email, tel, role, passwordHash });
  }

  toPrisma() {
    return {
      name: this.name,
      email: this.email,
      tel: this.tel,
      password_hash: this.passwordHash,
      role: this.role,
    };
  }

  toPublic() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      tel: this.tel,
      role: this.role,
    };
  }
}
