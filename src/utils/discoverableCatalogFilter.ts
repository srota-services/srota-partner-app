export function isDiscoverableAuthor(
  authorId: string,
  discoverableAuthorIds: Set<string>
): boolean {
  return discoverableAuthorIds.has(authorId);
}

export function isDiscoverableOrg(
  organizationId: string,
  discoverableOrgIds: Set<string>
): boolean {
  return discoverableOrgIds.has(organizationId);
}
