export class Resident {
  constructor({ name, phone, active = true }) {
    this.name = name;
    this.phone = phone;
    this.active = active;
  }

  // Regla de Negocio: Validar si el residente puede recibir paquetes
  canReceivePackages() {
    return this.active && this.name && this.name.trim().length > 0;
  }
}
