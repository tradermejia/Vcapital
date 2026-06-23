import { ResidentRepository } from "../../domain/repositories/ResidentRepository";

const INITIAL_RESIDENTS = [
  { name: "Camila Gómez", phone: "+573001234567", active: true },
  { name: "Carlos Mendoza", phone: "+573119876543", active: true },
  { name: "María José Silva", phone: "+573151112222", active: true },
  { name: "Andrés Castillo", phone: "+573203334444", active: true },
  { name: "Diana Turbay", phone: "+573105556666", active: false },
  { name: "Felipe Ortiz", phone: "+573017778888", active: true },
  { name: "Liliana Restrepo", phone: "+573129990000", active: true },
  { name: "Juan Carlos Pérez", phone: "+573132223333", active: true }
];

export class LocalStorageResidentRepository extends ResidentRepository {
  getAll() {
    const saved = localStorage.getItem("portier_residents");
    return saved ? JSON.parse(saved) : INITIAL_RESIDENTS;
  }

  saveAll(residents) {
    localStorage.setItem("portier_residents", JSON.stringify(residents));
  }
}
