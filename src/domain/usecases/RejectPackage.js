export class RejectPackage {
  constructor(packageRepository) {
    this.packageRepository = packageRepository;
  }

  execute(packageId, reason) {
    const packages = this.packageRepository.getAll();
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) throw new Error("Paquete no encontrado");

    pkg.status = "rechazado";
    pkg.authorizedAt = new Date().toISOString();
    pkg.rejectReason = reason;

    this.packageRepository.update(pkg);
    return pkg;
  }
}
