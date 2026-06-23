export class DeliverPackage {
  constructor(packageRepository) {
    this.packageRepository = packageRepository;
  }

  execute(packageId) {
    const packages = this.packageRepository.getAll();
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) throw new Error("Paquete no encontrado");

    pkg.status = "entregado";
    pkg.deliveredAt = new Date().toISOString();

    this.packageRepository.update(pkg);
    return pkg;
  }
}
