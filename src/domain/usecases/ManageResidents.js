import { Resident } from "../entities/Resident";

export class ManageResidents {
  constructor(residentRepository) {
    this.residentRepository = residentRepository;
  }

  toggleStatus(phone) {
    const residents = this.residentRepository.getAll();
    const updated = residents.map(res => {
      if (res.phone === phone) {
        return new Resident({ ...res, active: !res.active });
      }
      return new Resident(res);
    });
    this.residentRepository.saveAll(updated);
    return updated;
  }

  addResident(name, phone) {
    const residents = this.residentRepository.getAll();
    if (residents.some(res => res.phone === phone)) return false;

    const newRes = new Resident({ name, phone, active: true });
    residents.push(newRes);
    this.residentRepository.saveAll(residents);
    return true;
  }
}
