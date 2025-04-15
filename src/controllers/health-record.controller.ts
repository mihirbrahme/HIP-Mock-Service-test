import { Request, Response } from 'express';
import { HealthRecordService } from '../services/health-record/HealthRecordService';
import { HealthRecordType } from '../services/health-record/types/HealthRecordType';
import { RecordStatus } from '../services/health-record/types/RecordStatus';
import { HealthRecordResponseDto } from '../dtos/health-record/HealthRecordResponseDto';

export class HealthRecordController {
  private healthRecordService: HealthRecordService;

  constructor() {
    this.healthRecordService = new HealthRecordService();
  }

  async createRecord(req: Request, res: Response): Promise<void> {
    try {
      const { patientId, careContextId, recordType, data, metadata } = req.body;

      if (!patientId || !careContextId || !recordType || !data) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const record = await this.healthRecordService.createRecord(
        patientId,
        careContextId,
        recordType as HealthRecordType,
        data,
        metadata || {}
      );

      const responseDto = new HealthRecordResponseDto(record);
      res.status(201).json(responseDto);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create health record' });
    }
  }

  async getRecordById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const record = await this.healthRecordService.getRecordById(id);

      if (!record) {
        res.status(404).json({ error: 'Health record not found' });
        return;
      }

      const responseDto = new HealthRecordResponseDto(record);
      res.status(200).json(responseDto);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve health record' });
    }
  }

  async getRecordsByPatientId(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const { recordType, status, startDate, endDate } = req.query;

      const filters = {
        recordType: recordType as HealthRecordType | undefined,
        status: status as RecordStatus | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      };

      const records = await this.healthRecordService.getRecordsByPatientId(patientId, filters);
      const responseDtos = records.map(record => new HealthRecordResponseDto(record));
      res.status(200).json(responseDtos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve health records' });
    }
  }

  async updateRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const record = await this.healthRecordService.updateRecord(id, updates);
      const responseDto = new HealthRecordResponseDto(record);
      res.status(200).json(responseDto);
    } catch (error) {
      if (error.message === 'Record not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update health record' });
      }
    }
  }

  async deleteRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.healthRecordService.deleteRecord(id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Record not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete health record' });
      }
    }
  }

  async changeRecordStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(RecordStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const record = await this.healthRecordService.changeRecordStatus(id, status as RecordStatus);
      const responseDto = new HealthRecordResponseDto(record);
      res.status(200).json(responseDto);
    } catch (error) {
      if (error.message === 'Record not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update health record status' });
      }
    }
  }

  async getRecordHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const history = await this.healthRecordService.getRecordHistory(id);
      const responseDtos = history.map(record => new HealthRecordResponseDto(record));
      res.status(200).json(responseDtos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve health record history' });
    }
  }
} 