import { PackageRepository } from "../../domain/repositories/PackageRepository";

const INITIAL_PACKAGES = [
  {
    id: "NX-88219",
    title: "MacBook Pro 16\"",
    priority: "Alta",
    residentName: "Juan Carlos Pérez",
    residentPhone: "+573132223333",
    trackingNumber: "AMZN-99221",
    status: "autorizado",
    notes: "Entregar urgente si es posible",
    preRegisteredAt: "2026-06-19T09:15:00-05:00",
    receivedAt: "2026-06-20T14:02:00-05:00",
    authorizedAt: "2026-06-20T14:15:00-05:00",
    deliveredAt: null,
    guardName: "Rodrigo M.",
    rejectReason: "",
    otp: "8821",
    signature: "J. C. Pérez",
    photos: {
      label: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3vyG7PG-BTn2tz5Ve5kSAs1tmNelfOnDiF0qDroCQDVfGaE30_kn3LSPtxBwF8I-nHG1l6IeB_qbj8r8fwbW-ZkcjPY5RMtawoQ4v8NQCYcrhw2s35lwO2-WO1b3D4Jkgg_gm0mx0jH2VZzeK19MWc11Uplki-KWDgbeyCEAWdbgvzVRFTVsVYl_LmqLnPBjTN2n74x_htOUOZc_PM0hfU9pnbttG-1ll9H--ZIZaPlHNDgBOavHwYDaBHkoUHGKPqy47tVxpgok",
      package: "https://lh3.googleusercontent.com/aida-public/AB6AXuDID-FncxrwywhP4IV3oSUZLN8xP9ySqkDq5bv07ICPQLRrqbgpF-n461_kLYa6KUeLbeSAXvgar3vsbTp69W5pebMTuUKWeA8QT4j_TwtDDQ9pn6aVZNqC-wYQ0zjSzmey78-nVHl96NHWP1oMTfLQ-Nx_iSLhy6o8Ggoge9fT5W4jveNGtTkVx2v5ueockgP80jDNVIlqj92nvtTJSS_RIQmhqra5QutiM6ryslv_gXrAxBir4UMV9sGnTgq6h7Ns71bRSuqffYA",
      context: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdyHOfp0TQ5eCF0ZzQZhDSFNPqCeTjWY70iCMIWajDGUyXaszmRe277Wl80UU5y1nIQo_sVXCeVCYRmgWOA9kofUwr_sNhUZzA1PnaC3uoWZ1DUTGrU94PjKSSS0o76s02WoEnAkKUBlY4WajBPVbp03CPYOcLgI9QMXFUgLtUoX-d-EZ9FsG9pkfL1KcDWr5yL9bYrRIf6j74j9cmo2633q0xzPqCvkG4hVaLzZGMYzPD6AsbUjOwzdMv5TJmciBYUjQ7ygWt930"
    }
  },
  {
    id: "NX-55210",
    title: "Zapatos Deportivos",
    priority: "Media",
    residentName: "Camila Gómez",
    residentPhone: "+573001234567",
    trackingNumber: "MELI-55210",
    status: "recibido",
    notes: "Dejar en recepción si no contesto",
    preRegisteredAt: "2026-06-20T08:00:00-05:00",
    receivedAt: "2026-06-20T10:45:00-05:00",
    authorizedAt: null,
    deliveredAt: null,
    guardName: "Edwin S.",
    rejectReason: "",
    otp: "5521",
    signature: null,
    photos: {
      label: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3vyG7PG-BTn2tz5Ve5kSAs1tmNelfOnDiF0qDroCQDVfGaE30_kn3LSPtxBwF8I-nHG1l6IeB_qbj8r8fwbW-ZkcjPY5RMtawoQ4v8NQCYcrhw2s35lwO2-WO1b3D4Jkgg_gm0mx0jH2VZzeK19MWc11Uplki-KWDgbeyCEAWdbgvzVRFTVsVYl_LmqLnPBjTN2n74x_htOUOZc_PM0hfU9pnbttG-1ll9H--ZIZaPlHNDgBOavHwYDaBHkoUHGKPqy47tVxpgok",
      package: "https://lh3.googleusercontent.com/aida-public/AB6AXuDID-FncxrwywhP4IV3oSUZLN8xP9ySqkDq5bv07ICPQLRrqbgpF-n461_kLYa6KUeLbeSAXvgar3vsbTp69W5pebMTuUKWeA8QT4j_TwtDDQ9pn6aVZNqC-wYQ0zjSzmey78-nVHl96NHWP1oMTfLQ-Nx_iSLhy6o8Ggoge9fT5W4jveNGtTkVx2v5ueockgP80jDNVIlqj92nvtTJSS_RIQmhqra5QutiM6ryslv_gXrAxBir4UMV9sGnTgq6h7Ns71bRSuqffYA",
      context: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdyHOfp0TQ5eCF0ZzQZhDSFNPqCeTjWY70iCMIWajDGUyXaszmRe277Wl80UU5y1nIQo_sVXCeVCYRmgWOA9kofUwr_sNhUZzA1PnaC3uoWZ1DUTGrU94PjKSSS0o76s02WoEnAkKUBlY4WajBPVbp03CPYOcLgI9QMXFUgLtUoX-d-EZ9FsG9pkfL1KcDWr5yL9bYrRIf6j74j9cmo2633q0xzPqCvkG4hVaLzZGMYzPD6AsbUjOwzdMv5TJmciBYUjQ7ygWt930"
    }
  },
  {
    id: "NX-11029",
    title: "Libros de Estudio",
    priority: "Baja",
    residentName: "Felipe Ortiz",
    residentPhone: "+573017778888",
    trackingNumber: "DHL-11029",
    status: "entregado",
    notes: "",
    preRegisteredAt: null,
    receivedAt: "2026-06-18T11:00:00-05:00",
    authorizedAt: "2026-06-18T11:05:00-05:00",
    deliveredAt: "2026-06-18T17:30:00-05:00",
    guardName: "Edwin S.",
    rejectReason: "",
    otp: "1102",
    signature: "Felipe Ortiz",
    photos: {
      label: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3vyG7PG-BTn2tz5Ve5kSAs1tmNelfOnDiF0qDroCQDVfGaE30_kn3LSPtxBwF8I-nHG1l6IeB_qbj8r8fwbW-ZkcjPY5RMtawoQ4v8NQCYcrhw2s35lwO2-WO1b3D4Jkgg_gm0mx0jH2VZzeK19MWc11Uplki-KWDgbeyCEAWdbgvzVRFTVsVYl_LmqLnPBjTN2n74x_htOUOZc_PM0hfU9pnbttG-1ll9H--ZIZaPlHNDgBOavHwYDaBHkoUHGKPqy47tVxpgok",
      package: "https://lh3.googleusercontent.com/aida-public/AB6AXuDID-FncxrwywhP4IV3oSUZLN8xP9ySqkDq5bv07ICPQLRrqbgpF-n461_kLYa6KUeLbeSAXvgar3vsbTp69W5pebMTuUKWeA8QT4j_TwtDDQ9pn6aVZNqC-wYQ0zjSzmey78-nVHl96NHWP1oMTfLQ-Nx_iSLhy6o8Ggoge9fT5W4jveNGtTkVx2v5ueockgP80jDNVIlqj92nvtTJSS_RIQmhqra5QutiM6ryslv_gXrAxBir4UMV9sGnTgq6h7Ns71bRSuqffYA",
      context: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdyHOfp0TQ5eCF0ZzQZhDSFNPqCeTjWY70iCMIWajDGUyXaszmRe277Wl80UU5y1nIQo_sVXCeVCYRmgWOA9kofUwr_sNhUZzA1PnaC3uoWZ1DUTGrU94PjKSSS0o76s02WoEnAkKUBlY4WajBPVbp03CPYOcLgI9QMXFUgLtUoX-d-EZ9FsG9pkfL1KcDWr5yL9bYrRIf6j74j9cmo2633q0xzPqCvkG4hVaLzZGMYzPD6AsbUjOwzdMv5TJmciBYUjQ7ygWt930"
    }
  },
  {
    id: "NX-44122",
    title: "Suplementos Alimenticios",
    priority: "Baja",
    residentName: "Juan Carlos Pérez",
    residentPhone: "+573132223333",
    trackingNumber: "",
    status: "pre_registrado",
    notes: "Viene en caja pequeña",
    preRegisteredAt: "2026-06-20T09:00:00-05:00",
    receivedAt: null,
    authorizedAt: null,
    deliveredAt: null,
    guardName: "",
    rejectReason: "",
    otp: "4412",
    signature: null,
    photos: null
  }
];

export class LocalStoragePackageRepository extends PackageRepository {
  getAll() {
    const saved = localStorage.getItem("portier_packages");
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  }

  save(pkg) {
    const packages = this.getAll();
    packages.unshift(pkg);
    localStorage.setItem("portier_packages", JSON.stringify(packages));
  }

  update(updatedPkg) {
    const packages = this.getAll().map(pkg => pkg.id === updatedPkg.id ? updatedPkg : pkg);
    localStorage.setItem("portier_packages", JSON.stringify(packages));
  }
}
