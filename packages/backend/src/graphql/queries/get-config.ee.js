import appConfig from '../../config/app.js';
import { hasValidLicense } from '../../helpers/license.ee.js';
import Config from '../../models/config.js';

const defaultConfig = {
  disableNotificationsPage: appConfig.disableNotificationsPage,
};

const getConfig = async (_parent, params) => {
  if (!(await hasValidLicense())) return {};

  const configQuery = Config.query();

  if (Array.isArray(params.keys)) {
    configQuery.whereIn('key', params.keys);
  }

  const config = await configQuery.orderBy('key', 'asc');

  return config.reduce((computedConfig, configEntry) => {
    const { key, value } = configEntry;

    computedConfig[key] = value?.data;

    return computedConfig;
  }, defaultConfig);
};

export default getConfig;
