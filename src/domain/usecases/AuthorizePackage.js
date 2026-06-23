export class AuthorizePackage {
  constructor(packageRepository) {
    this.packageRepository = packageRepository;
  }

  execute(packageId, signature) {
    const packages = this.packageRepository.getAll();
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) throw new Error("Paquete no encontrado");

    pkg.status = "autorizado";
    pkg.authorizedAt = new Date().toISOString();
    pkg.signature = signature;

    this.packageRepository.update(pkg);
    return pkg;
  }
}
