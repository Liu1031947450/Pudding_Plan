import { useState } from 'react';
import * as Location from 'expo-location';

export function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const fetchRealLocation = async (
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void,
  ) => {
    setIsLocating(true);
    try {
      // 1. 检查定位服务是否开启
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        showToast('定位服务未开启，请在系统设置中打开', 'error');
        return null;
      }

      // 2. 检查并请求权限
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showToast('请授予位置权限以查看附近地点', 'error');
        return null;
      }

      // 3. 优先尝试快速获取上一次的已知位置
      let locResult = await Location.getLastKnownPositionAsync({});

      if (!locResult) {
        // 4. 发起真实的 GPS 搜索，并增加超时控制
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 8000),
        );

        locResult = (await Promise.race([
          locationPromise,
          timeoutPromise,
        ])) as Location.LocationObject;
      }

      if (locResult) {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: locResult.coords.latitude,
          longitude: locResult.coords.longitude,
        });

        if (address) {
          const city = address.city || address.region || '';
          const district = address.district || '';

          const name = [city, district, address.street, address.name]
            .filter(Boolean)
            .join('');
          if (name) {
            setNearbyLocations([{ name, sub: '设备定位结果', id: 'current' }]);
            return name;
          }
        }
      }
    } catch (error: any) {
      console.error('获取定位出错:', error);
      if (error.message === 'TIMEOUT') {
        showToast('获取位置超时，请重试', 'error');
      } else {
        showToast('获取位置失败，请检查设置', 'error');
      }
    } finally {
      setIsLocating(false);
    }
    return null;
  };

  return {
    isLocating,
    nearbyLocations,
    setNearbyLocations,
    fetchRealLocation,
  };
}
