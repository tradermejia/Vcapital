import { createContext, useContext, useState, useEffect } from "react";
import { LocalStoragePackageRepository } from "../data/repositories/LocalStoragePackageRepository";
import { LocalStorageResidentRepository } from "../data/repositories/LocalStorageResidentRepository";
import { PreRegisterPackage } from "../domain/usecases/PreRegisterPackage";
import { ReceivePackage } from "../domain/usecases/ReceivePackage";
import { ReceiveDirectPackage } from "../domain/usecases/ReceiveDirectPackage";
import { AuthorizePackage } from "../domain/usecases/AuthorizePackage";
import { RejectPackage } from "../domain/usecases/RejectPackage";
import { DeliverPackage } from "../domain/usecases/DeliverPackage";
import { ManageResidents } from "../domain/usecases/ManageResidents";

const PackageContext = createContext();

export const COLOMBIAN_CARRIERS = [
  "Servientrega",
  "Envía",
  "Interrapidísimo",
  "Coordinadora",
  "Deprisa",
  "TCC",
  "4-72",
  "Mensajeros Urbanos",
  "Rappi",
  "FedEx",
  "DHL",
  "Amazon",
  "MercadoLibre",
  "Particular"
];

// Instanciar los repositorios físicos (Capa de Datos)
const packageRepository = new LocalStoragePackageRepository();
const residentRepository = new LocalStorageResidentRepository();

// Instanciar los Casos de Uso (Capa de Dominio) con sus respectivos repositorios
const preRegisterPackageUseCase = new PreRegisterPackage(packageRepository);
const receivePackageUseCase = new ReceivePackage(packageRepository);
const receiveDirectPackageUseCase = new ReceiveDirectPackage(packageRepository);
const authorizePackageUseCase = new AuthorizePackage(packageRepository);
const rejectPackageUseCase = new RejectPackage(packageRepository);
const deliverPackageUseCase = new DeliverPackage(packageRepository);
const manageResidentsUseCase = new ManageResidents(residentRepository);

export function PackageProvider({ children }) {
  // Manejo de Estados Reactivos en la Capa de Presentación
  const [packages, setPackages] = useState(() => packageRepository.getAll());
  const [residents, setResidents] = useState(() => residentRepository.getAll());

  // Acciones que las pantallas de React invocarán
  const preRegisterPackage = (residentPhone, residentName, trackingNumber, notes) => {
    const newPkg = preRegisterPackageUseCase.execute(residentPhone, residentName, trackingNumber, notes);
    setPackages(packageRepository.getAll());
    return newPkg;
  };

  const receivePackage = (packageId, guardName, photos) => {
    receivePackageUseCase.execute(packageId, guardName, photos);
    setPackages(packageRepository.getAll());
  };

  const receiveDirectPackage = (residentPhone, residentName, trackingNumber, notes, guardName, photos, status = "recibido", rejectReason = "") => {
    const newPkg = receiveDirectPackageUseCase.execute(residentPhone, residentName, trackingNumber, notes, guardName, photos, status, rejectReason);
    setPackages(packageRepository.getAll());
    return newPkg;
  };

  const authorizePackage = (packageId, signature) => {
    authorizePackageUseCase.execute(packageId, signature);
    setPackages(packageRepository.getAll());
  };

  const rejectPackage = (packageId, reason) => {
    rejectPackageUseCase.execute(packageId, reason);
    setPackages(packageRepository.getAll());
  };

  const deliverPackage = (packageId) => {
    deliverPackageUseCase.execute(packageId);
    setPackages(packageRepository.getAll());
  };

  const toggleResidentStatus = (phone) => {
    const updated = manageResidentsUseCase.toggleStatus(phone);
    setResidents(updated);
  };

  const addResident = (name, phone) => {
    const success = manageResidentsUseCase.addResident(name, phone);
    if (success) {
      setResidents(residentRepository.getAll());
    }
    return success;
  };

  return (
    <PackageContext.Provider value={{
      packages,
      residents,
      preRegisterPackage,
      receivePackage,
      receiveDirectPackage,
      authorizePackage,
      rejectPackage,
      deliverPackage,
      toggleResidentStatus,
      addResident
    }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackages() {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error("usePackages debe usarse dentro de un PackageProvider");
  }
  return context;
}
