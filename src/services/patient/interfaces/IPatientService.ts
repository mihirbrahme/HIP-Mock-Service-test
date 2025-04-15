export interface IPatientService {
  /**
   * Gets a patient by ID
   * @param id The patient ID
   * @returns The patient or null if not found
   */
  getPatientById(id: string): Promise<Record<string, unknown> | null>;

  /**
   * Gets a care context by ID
   * @param id The care context ID
   * @returns The care context or null if not found
   */
  getCareContextById(id: string): Promise<Record<string, unknown> | null>;

  /**
   * Validates a patient's ABHA ID
   * @param abhaId The ABHA ID to validate
   * @returns true if valid, false otherwise
   */
  validateAbhaId(abhaId: string): Promise<boolean>;

  /**
   * Gets all care contexts for a patient
   * @param patientId The patient ID
   * @returns Array of care contexts
   */
  getPatientCareContexts(patientId: string): Promise<Record<string, unknown>[]>;
} 