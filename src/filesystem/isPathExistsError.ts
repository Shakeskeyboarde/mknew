export function isPathExistsError(error: unknown): boolean {
  return error instanceof Error && (error as { code?: string }).code === 'EEXIST';
}
