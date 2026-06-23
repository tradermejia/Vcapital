import { Package } from "../entities/Package";

export class PreRegisterPackage {
  constructor(packageRepository) {
    this.packageRepository = packageRepository;
  }

  execute(residentPhone, residentName, trackingNumber, notes) {
    const newPkg = new Package({
      id: `NX-${Math.floor(10000 + Math.random() * 90000)}`,
      title: "Envío",
      residentName,
      residentPhone,
      trackingNumber: trackingNumber || "",
      status: "pre_registrado",
      notes: notes || "",
      preRegisteredAt: new Date().toISOString()
    });

    this.packageRepository.save(newPkg);
    return newPkg;
  }
}
