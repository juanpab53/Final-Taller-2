import { Email } from "./Email.js";
import { ValidationError } from "../../shared/errors/ValidationError.js";

export class User {
  constructor({ id, name = "", email, tel = "", role = "CLIENT", passwordHash }) {
    if (!email) {
      throw new ValidationError("Email is required to create a user.");
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
