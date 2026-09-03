import SystemSettings from '../models/SystemSettings.js';
import Notification from '../models/Notification.js';
import { invalidateMaintenanceCache, getMaintenanceState } from '../middleware/maintenance.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    console.error('[Get Settings Error]', error);
    res.status(500).json({ success: false, message: 'Error fetching system settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const previousMaintenance = await getMaintenanceState();
    const previousDoc = await SystemSettings.findOne().select('maintenanceMode').lean();

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      settings = await SystemSettings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }

    invalidateMaintenanceCache();

    const newMaintenance = settings?.maintenanceMode ?? false;
    const oldMaintenance = previousDoc?.maintenanceMode ?? previousMaintenance;

    if (oldMaintenance !== newMaintenance) {
      try {
        await Notification.create({
          type: 'SYSTEM',
          title: newMaintenance ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
          message: newMaintenance ? 'Maintenance mode enabled.' : 'Maintenance mode disabled.',
          entityType: 'SystemSettings',
          entityId: settings._id
        });
      } catch (notifyErr) {
        console.error('[Settings Update] Failed to create maintenance notification', notifyErr);
      }
    }

    res.status(200).json({ success: true, data: { settings }, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('[Update Settings Error]', error);
    res.status(500).json({ success: false, message: 'Error updating system settings' });
  }
};
