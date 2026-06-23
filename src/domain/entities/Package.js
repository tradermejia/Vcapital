export class Package {
  constructor({
    id,
    title = "Envío",
    residentName,
    residentPhone = "",
    trackingNumber = "",
    status = "pre_registrado",
    notes = "",
    preRegisteredAt = null,
    receivedAt = null,
    authorizedAt = null,
    deliveredAt = null,
    guardName = "",
    rejectReason = "",
    otp = "",
    signature = null,
    photos = null
  }) {
    this.id = id;
    this.title = title;
    this.residentName = residentName;
    this.residentPhone = residentPhone;
    this.trackingNumber = trackingNumber;
    this.status = status;
    this.notes = notes;
    this.preRegisteredAt = preRegisteredAt;
    this.receivedAt = receivedAt;
    this.authorizedAt = authorizedAt;
    this.deliveredAt = deliveredAt;
    this.guardName = guardName;
    this.rejectReason = rejectReason;
    
    // Si no tiene número de guía y no se ha especificado un OTP, se genera el PIN
    if (!trackingNumber && !otp) {
      this.otp = Math.floor(1000 + Math.random() * 9000).toString();
    } else {
      this.otp = otp || "";
    }
    
    this.signature = signature;
    this.photos = photos;
  }

  // Regla de Negocio: Validar si la firma es válida
  hasValidSignature() {
    return this.signature && this.signature.trim().length > 0;
  }

  // Regla de Negocio: Validar si el paquete ya fue entregado
  isDelivered() {
    return this.status === "entregado" && this.deliveredAt !== null;
  }
}
