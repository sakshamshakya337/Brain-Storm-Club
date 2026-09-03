import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { filter = 'All' } = req.query; // 'All', 'Unread', 'Read'
    
    let query = {};
    if (filter === 'Unread') query.isRead = false;
    if (filter === 'Read') query.isRead = true;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error('[Get Notifications Error]', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    
    res.status(200).json({ success: true, data: { notification } });
  } catch (error) {
    console.error('[Mark As Read Error]', error);
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[Mark All Read Error]', error);
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
};
