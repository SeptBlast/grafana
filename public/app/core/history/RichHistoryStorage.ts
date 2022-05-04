import { RichHistorySearchFilters, RichHistorySettings } from 'app/core/utils/richHistory';

import { DataSourceRef } from '../../../../packages/grafana-data';
import { RichHistoryQuery } from '../../types';

/**
 * Errors are used when the operation on Rich History was not successful.
 */
export enum RichHistoryServiceError {
  StorageFull = 'StorageFull',
  DuplicatedEntry = 'DuplicatedEntry',
}

/**
 * Warnings are used when an entry has been added but there are some side effects that user should be informed about.
 */
export enum RichHistoryStorageWarning {
  /**
   * Returned when an entry was successfully added but maximum items limit has been reached and old entries have been removed.
   */
  LimitExceeded = 'LimitExceeded',
}

/**
 * Detailed information about the warning that can be shown to the user
 */
export type RichHistoryStorageWarningDetails = {
  type: RichHistoryStorageWarning;
  message: string;
};

export type RichHistoryResults = { richHistory: RichHistoryQuery[]; total?: number };

/**
 * @internal
 * @alpha
 */
export default interface RichHistoryStorage {
  getRichHistory(filters: RichHistorySearchFilters): Promise<RichHistoryResults>;

  /**
   * Creates new RichHistoryQuery, returns object with unique id and created date
   */
  addToRichHistory(
    newRichHistoryQuery: Omit<RichHistoryQuery, 'id' | 'createdAt'>
  ): Promise<{ warning?: RichHistoryStorageWarningDetails; richHistoryQuery: RichHistoryQuery }>;

  deleteAll(): Promise<void>;
  deleteRichHistory(id: string): Promise<void>;
  updateStarred(id: string, starred: boolean): Promise<RichHistoryQuery>;
  updateComment(id: string, comment: string | undefined): Promise<RichHistoryQuery>;

  getSettings(): Promise<RichHistorySettings>;
  updateSettings(settings: RichHistorySettings): Promise<void>;
}

/**
 * Simple data source srv mock used for testing remote and local storage conversions between
 * uid and data source name.
 */
export const DataSourceSrvMock = {
  getInstanceSettings: (ref: DataSourceRef | string) => {
    if (ref === 'invalid' || (typeof ref !== 'string' && ref.uid === 'invalid')) {
      throw Error('Data source not found');
    } else {
      return typeof ref === 'string'
        ? { uid: ref.slice('name-of-'.length), name: ref }
        : { uid: ref.uid, name: `name-of-${ref.uid}` };
    }
  },
};
