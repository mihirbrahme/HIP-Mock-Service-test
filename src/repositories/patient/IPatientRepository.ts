import { Patient } from '../../entities/Patient';
import { CareContext } from '../../entities/CareContext';
import { SearchPatientDto } from '../../dtos/patient/SearchPatientDto';
import { CreatePatientDto } from '../../dtos/patient/CreatePatientDto';
import { UpdatePatientDto } from '../../dtos/patient/UpdatePatientDto';

/**
 * Interface for Patient Repository operations
 */
export interface IPatientRepository {
  /**
   * Create a new patient record
   * @param data Patient creation data
   * @returns Created patient
   */
  create(data: CreatePatientDto): Promise<Patient>;

  /**
   * Find patient by ID
   * @param id Patient UUID
   * @returns Patient if found, null otherwise
   */
  findById(id: string): Promise<Patient | null>;

  /**
   * Find patient by ABHA number
   * @param abhaNumber ABHA identification number
   * @returns Patient if found, null otherwise
   */
  findByAbhaNumber(abhaNumber: string): Promise<Patient | null>;

  /**
   * Update patient information
   * @param id Patient UUID
   * @param data Update data
   * @returns Updated patient
   */
  update(id: string, data: UpdatePatientDto): Promise<Patient>;

  /**
   * Search patients based on criteria
   * @param searchParams Search parameters
   * @returns Array of matching patients
   */
  search(searchParams: SearchPatientDto): Promise<Patient[]>;

  /**
   * Add care context to patient
   * @param patientId Patient UUID
   * @param careContext Care context data
   * @returns Created care context
   */
  addCareContext(patientId: string, careContext: Partial<CareContext>): Promise<CareContext>;

  /**
   * Get all care contexts for a patient
   * @param patientId Patient UUID
   * @returns Array of care contexts
   */
  getCareContexts(patientId: string): Promise<CareContext[]>;

  /**
   * Delete patient record
   * @param id Patient UUID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Verify if ABHA number is valid and not already registered
   * @param abhaNumber ABHA identification number
   * @returns true if valid and available, false otherwise
   */
  verifyAbhaNumber(abhaNumber: string): Promise<boolean>;
} 