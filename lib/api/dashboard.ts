import { propertiesApi } from './properties';

export const dashboardApi = {
  get: (propertyId?: number) => propertiesApi.dashboard(propertyId),
};
