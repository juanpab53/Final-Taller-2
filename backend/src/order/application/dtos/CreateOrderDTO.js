import { ValidationError } from "../../../shared/errors/ValidationError.js";

export class CreateOrderDTO {
  constructor({ shipping }) {
    if (!shipping) throw new ValidationError('Shipping information is required.');

    const { first, last, address, city, state, zip } = shipping;
    if (!first || !last || !address || !city || !state || !zip) {
      throw new ValidationError('All required shipping fields must be provided: first, last, address, city, state, zip.');
    }

    this.shipping = {
      first: first.trim(),
      last: last.trim(),
      address: address.trim(),
      apt: (shipping.apt || '').trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
    };
  }
}
