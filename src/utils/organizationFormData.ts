import type {
  CompletePartnerOrganizationInput,
  UpdateOrganizationRequest,
} from '../types/partner';

export function buildOrganizationFormData(
  input: CompletePartnerOrganizationInput
): FormData {
  const formData = new FormData();
  formData.append('name', input.organizationName.trim());

  if (input.websiteUrl?.trim()) {
    formData.append('websiteUrl', input.websiteUrl.trim());
  }
  if (input.teamSize) {
    formData.append('teamSize', input.teamSize);
  }
  if (input.preferredGenre?.trim()) {
    formData.append('preferredGenre', input.preferredGenre.trim());
  }
  if (input.image) {
    formData.append('image', input.image);
  }

  return formData;
}

export function buildOrganizationUpdateFormData(
  input: UpdateOrganizationRequest
): FormData {
  const formData = new FormData();

  if (input.name !== undefined) {
    formData.append('name', input.name.trim());
  }
  if (input.description !== undefined) {
    formData.append('description', input.description.trim());
  }
  if (input.websiteUrl !== undefined) {
    if (input.websiteUrl?.trim()) {
      formData.append('websiteUrl', input.websiteUrl.trim());
    } else {
      formData.append('websiteUrl', '');
    }
  }
  if (input.teamSize !== undefined) {
    if (input.teamSize) {
      formData.append('teamSize', input.teamSize);
    } else {
      formData.append('teamSize', '');
    }
  }
  if (input.preferredGenre !== undefined) {
    if (input.preferredGenre?.trim()) {
      formData.append('preferredGenre', input.preferredGenre.trim());
    } else {
      formData.append('preferredGenre', '');
    }
  }
  if (input.discoverable !== undefined) {
    formData.append('discoverable', input.discoverable ? 'true' : 'false');
  }
  if (input.image) {
    formData.append('image', input.image);
  }

  return formData;
}
