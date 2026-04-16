/**
 * @deprecated 请使用 useNotifications() from '../contexts' 替代。
 * 此文件保留仅为向后兼容。
 */
import { useNotifications } from '../contexts';

export const useNotificationState = () => {
  return useNotifications();
};
