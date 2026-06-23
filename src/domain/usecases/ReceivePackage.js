export class ReceivePackage {
  constructor(packageRepository) {
    this.packageRepository = packageRepository;
  }

  execute(packageId, guardName, photos) {
    const packages = this.packageRepository.getAll();
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) throw new Error("Paquete no encontrado");

    pkg.status = "recibido";
    pkg.receivedAt = new Date().toISOString();
    pkg.guardName = guardName;
    pkg.photos = photos || {
      label: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3vyG7PG-BTn2tz5Ve5kSAs1tmNelfOnDiF0qDroCQDVfGaE30_kn3LSPtxBwF8I-nHG1l6IeB_qbj8r8fwbW-ZkcjPY5RMtawoQ4v8NQCYcrhw2s35lwO2-WO1b3D4Jkgg_gm0mx0jH2VZzeK19MWc11Uplki-KWDgbeyCEAWdbgvzVRFTVsVYl_LmqLnPBjTN2n74x_htOUOZc_PM0hfU9pnbttG-1ll9H--ZIZaPlHNDgBOavHwYDaBHkoUHGKPqy47tVxpgok",
      package: "https://lh3.googleusercontent.com/aida-public/AB6AXuDID-FncxrwywhP4IV3oSUZLN8xP9ySqkDq5bv07ICPQLRrqbgpF-n461_kLYa6KUeLbeSAXvgar3vsbTp69W5pebMTuUKWeA8QT4j_TwtDDQ9pn6aVZNqC-wYQ0zjSzmey78-nVHl96NHWP1oMTfLQ-Nx_iSLhy6o8Ggoge9fT5W4jveNGtTkVx2v5ueockgP80jDNVIlqj92nvtTJSS_RIQmhqra5QutiM6ryslv_gXrAxBir4UMV9sGnTgq6h7Ns71bRSuqffYA",
      context: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdyHOfp0TQ5eCF0ZzQZhDSFNPqCeTjWY70iCMIWajDGUyXaszmRe277Wl80UU5y1nIQo_sVXCeVCYRmgWOA9kofUwr_sNhUZzA1PnaC3uoWZ1DUTGrU94PjKSSS0o76s02WoEnAkKUBlY4WajBPVbp03CPYOcLgI9QMXFUgLtUoX-d-EZ9FsG9pkfL1KcDWr5yL9bYrRIf6j74j9cmo2633q0xzPqCvkG4hVaLzZGMYzPD6AsbUjOwzdMv5TJmciBYUjQ7ygWt930"
    };

    this.packageRepository.update(pkg);
    return pkg;
  }
}
