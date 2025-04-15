import { Request, Response } from 'express';
import { IHealthRecordService } from '../../services/health-record/interfaces/IHealthRecordService';
import { HealthRecordType, RecordStatus } from '../../infrastructure/database/entities/HealthRecord.entity';

export class HealthRecordController {
  constructor(private readonly healthRecordService: IHealthRecordService) {}

  /**
   * Creates a new health record
   */
  async createRecord(req: Request, res: Response): Promise<void> {
    try {
      const record = await this.healthRecordService.createRecord(req.body);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create health record' });
    }
  }

  /**
   * Retrieves a health record by ID
   */
  async getRecordById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const record = await this.healthRecordService.getRecordById(id);

      if (!record) {
        res.status(404).json({ error: 'Health record not found' });
        return;
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve health record' });
    }
  }

  /**
   * Retrieves health records for a patient
   */
  async getRecordsByPatientId(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const filters = {
        recordType: req.query.recordType ? (req.query.recordType as HealthRecordType) : undefined,
        status: req.query.status ? (req.query.status as RecordStatus) : undefined,
        fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
        toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined
      };

      const records = await this.healthRecordService.getRecordsByPatientId(patientId, filters);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve health records' });
    }
  }

  /**
   * Updates a health record
   */
  async updateRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const record = await this.healthRecordService.updateRecord(id, req.body);

      if (!record) {
        res.status(404).json({ error: 'Health record not found' });
        return;
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update health record' });
    }
  }

  /**
   * Deletes a health record
   */
  async deleteRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.healthRecordService.deleteRecord(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete health record' });
    }
  }

  /**
   * Changes the status of a health record
   */
  async changeRecordStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(RecordStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      await this.healthRecordService.changeRecordStatus(id, status);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to change health record status' });
    }
  }

  /**
   * Gets the version history of a health record
   */
  async getRecordHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await this.healthRecordService.getRecordHistory(id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve health record history' });
    }
  }
} 