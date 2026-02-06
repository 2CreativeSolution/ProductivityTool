const STORAGE_PREFIX = '@2CPD'

const buildStorageKey = (suffix) => `${STORAGE_PREFIX}/${suffix}`

export const STORAGE_KEYS = {
  authEmail: buildStorageKey('auth_email'),
  sidebarExpanded: buildStorageKey('sidebar_expanded'),
}

export { STORAGE_PREFIX, buildStorageKey }
