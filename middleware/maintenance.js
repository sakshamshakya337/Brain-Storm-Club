import SystemSettings from '../models/SystemSettings.js';

let cachedState = {
  maintenanceMode: false,
  lastFetched: 0
};

const CACHE_TTL = 5 * 1000;

export const getMaintenanceState = async () => {
  const now = Date.now();
  if (now - cachedState.lastFetched < CACHE_TTL) {
    return cachedState.maintenanceMode;
  }
  try {
    const settings = await SystemSettings.findOne().select('maintenanceMode').lean();
    cachedState.maintenanceMode = settings?.maintenanceMode ?? false;
    cachedState.lastFetched = now;
  } catch (err) {
    console.error('[Maintenance Cache] Failed to fetch settings', err);
  }
  return cachedState.maintenanceMode;
};

export const invalidateMaintenanceCache = () => {
  cachedState.lastFetched = 0;
};

const MAINTENANCE_BLOCKED_PREFIXES = ['/api/public'];
const AUTH_OR_ADMIN_PREFIXES = ['/api/auth', '/api/admin', '/api/images'];

const isBlockableWrite = (req) => {
  const method = req.method;
  const path = req.originalUrl || req.path;

  for (const prefix of AUTH_OR_ADMIN_PREFIXES) {
    if (path.startsWith(prefix)) return false;
  }

  for (const prefix of MAINTENANCE_BLOCKED_PREFIXES) {
    if (path.startsWith(prefix) && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      return true;
    }
  }

  return false;
};

export const maintenanceGuard = async (req, res, next) => {
  if (!isBlockableWrite(req)) return next();

  try {
    const isMaintenance = await getMaintenanceState();
    if (!isMaintenance) return next();

    return res.status(503).json({
      success: false,
      message: 'The website is currently under maintenance. Please try again later.'
    });
  } catch (err) {
    return next();
  }
};
