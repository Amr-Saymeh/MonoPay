export type SignupValues = {
  address: string;
  confirmPin: string;
  email: string;
  firstName: string;
  identityNumber: string;
  lastName: string;
  phone: string;
  pin: string;
};

export function sanitizeEmailInput(email: string) {
  return email.replace(/[^\x00-\x7F]/g, "");
}

export function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export function getSignupValidationError(
  values: SignupValues,
  t: (key: any) => string,
) {
  if (
    !values.firstName.trim() ||
    !values.lastName.trim() ||
    !values.email.trim() ||
    !values.phone.trim() ||
    !values.pin.trim() ||
    !values.confirmPin.trim() ||
    !values.address.trim() ||
    !values.identityNumber.trim()
  ) {
    return t("fillAllFields");
  }

  if (!isValidEmail(values.email)) {
    return t("invalidEmail");
  }

  if (values.pin.trim().length < 6) {
    return t("pinTooShort");
  }

  if (values.pin !== values.confirmPin) {
    return t("pinMismatch");
  }

  if (!Number.isFinite(Number(values.identityNumber))) {
    return t("invalidIdNumber");
  }

  return null;
}