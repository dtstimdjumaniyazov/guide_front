// LocationPicker.tsx - Полностью самодостаточный компонент
import React, { useState, useEffect, useRef } from 'react';

interface LocationPickerProps {
  // Внешние значения (опциональные - компонент может работать и без них)
  latitude?: number;
  longitude?: number;
  
  // Колбэки для передачи данных наружу
  onLocationChange?: (lat: number, lng: number) => void;
  onError?: (error: string | null) => void;
  
  // Настройки отображения
  showManualInput?: boolean;
  className?: string;
  error?: string;
  
  // Дефолтные координаты
  defaultLat?: number;
  defaultLng?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude: externalLat,
  longitude: externalLng,
  onLocationChange,
  onError,
  showManualInput = true,
  className = '',
  error: externalError,
  defaultLat = 41.2995, // Ташкент
  defaultLng = 69.2401
}) => {
  // Уникальный ID для избежания конфликтов карт
  const mapId = useRef(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Внутреннее состояние координат
  const [internalLat, setInternalLat] = useState<number>(externalLat || (externalLat === 0 ? 0 : defaultLat));
  const [internalLng, setInternalLng] = useState<number>(externalLng || (externalLng === 0 ? 0 : defaultLng));
  const [internalError, setInternalError] = useState<string | null>(null);
  
  // Состояние карты
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  
  // Состояние поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  
  const mapRef = useRef<HTMLDivElement>(null);

  // Используем либо внешние, либо внутренние координаты
  const currentLat = externalLat !== undefined ? externalLat : internalLat;
  const currentLng = externalLng !== undefined ? externalLng : internalLng;
  const currentError = externalError || internalError;

  // Для инициализации карты используем значения по умолчанию если координаты 0
  const mapInitLat = (currentLat && currentLat !== 0) ? currentLat : defaultLat;
  const mapInitLng = (currentLng && currentLng !== 0) ? currentLng : defaultLng;

  // Функция для обновления координат
  const updateCoordinates = (lat: number, lng: number) => {
    // Обновляем внутреннее состояние
    setInternalLat(lat);
    setInternalLng(lng);
    
    // Очищаем ошибки
    setInternalError(null);
    if (onError) onError(null);
    
    // Передаем наружу если есть колбэк
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }

    // Получаем и устанавливаем адрес
    getAddressByCoordinates(lat, lng)
      .then(address => {
        setCurrentAddress(address);
        // Если поле поиска пустое, заполняем его полученным адресом
        if (!searchQuery.trim()) {
          setSearchQuery(address);
        }
        console.log('Адрес обновлен:', address);
      })
      .catch(error => {
        console.log('Не удалось получить адрес:', error);
        setCurrentAddress('');
      });
  };

  // Функция для установки ошибки
  const setError = (error: string) => {
    setInternalError(error);
    if (onError) onError(error);
  };

  // Синхронизация с внешними координатами
  useEffect(() => {
    if (externalLat !== undefined && externalLng !== undefined) {
      setInternalLat(externalLat);
      setInternalLng(externalLng);
    }
  }, [externalLat, externalLng]);

  // Получение текущих координат через браузер
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateCoordinates(lat, lng);
        },
        (error) => {
          console.error('Ошибка получения геолокации:', error);
          const errorMessage = getGeolocationErrorMessage(error);
          setError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError('Геолокация не поддерживается вашим браузером.');
    }
  };

  const getGeolocationErrorMessage = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.";
      case error.POSITION_UNAVAILABLE:
        return "Информация о местоположении недоступна.";
      case error.TIMEOUT:
        return "Превышено время ожидания запроса геолокации.";
      default:
        return "Произошла неизвестная ошибка при получении геолокации.";
    }
  };

  // Получение адреса по координатам через Nominatim
  const getAddressByCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`
      );
      const data = await response.json();
      return data.display_name || 'Адрес не найден';
    } catch (error) {
      throw new Error('Ошибка получения адреса');
    }
  };

  // Поиск по адресу через Nominatim API
  const searchByAddress = async () => {
    if (!searchQuery.trim()) {
      setError('Введите адрес для поиска');
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=ru`
      );
      const data = await response.json();

      if (data.length > 0) {
        setSearchResults(data);
        setInternalError(null);
        if (onError) onError(null);
      } else {
        setError('Адрес не найден. Попробуйте другой запрос.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      setError('Ошибка при поиске адреса. Проверьте подключение к интернету.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Выбор результата поиска
  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    updateCoordinates(lat, lng);
    setSearchResults([]);
    setSearchQuery(result.display_name);
    
    // Перемещаем карту если она открыта
    if (map && marker) {
      map.setView([lat, lng], 15);
      marker.setLatLng([lat, lng]);
    }
  };

  // Обработчик ручного ввода координат
  const handleManualInput = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (field === 'latitude') {
      updateCoordinates(numValue, currentLng);
    } else {
      updateCoordinates(currentLat, numValue);
    }
  };

  // Загрузка Leaflet
  const loadLeaflet = () => {
    if (window.L) {
      setMapLoaded(true);
      setTimeout(initializeMap, 100);
      return;
    }

    if (document.querySelector('script[src*="leaflet.js"]')) {
      return;
    }

    // Загружаем CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(link);
    }

    // Загружаем JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.onload = () => {
      setMapLoaded(true);
      setTimeout(initializeMap, 100);
    };
    script.onerror = () => {
      setError('Не удалось загрузить библиотеку карт');
    };
    document.head.appendChild(script);
  };

  // Инициализация карты
  const initializeMap = () => {
    if (!window.L || !mapRef.current) return;

    try {
      // Удаляем старую карту
      if (map) {
        map.remove();
      }

      // Используем координаты для инициализации карты (Ташкент если координаты 0)
      const newMap = window.L.map(mapRef.current, {
        center: [mapInitLat, mapInitLng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });
      
      // Добавляем тайлы OpenStreetMap
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(newMap);

      // Создаем кастомную иконку маркера
      const customIcon = window.L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Создаем маркер (используем текущие координаты или координаты по умолчанию)
      const markerLat = (currentLat && currentLat !== 0) ? currentLat : defaultLat;
      const markerLng = (currentLng && currentLng !== 0) ? currentLng : defaultLng;
      
      const newMarker = window.L.marker([markerLat, markerLng], {
        draggable: true,
        icon: customIcon
      }).addTo(newMap);

      // Если координаты были 0, обновляем их на координаты Ташкента
      if (currentLat === 0 || currentLng === 0) {
        updateCoordinates(markerLat, markerLng);
      }

      // Обработчик перетаскивания маркера
      newMarker.on('dragend', async function(e: any) {
        const position = e.target.getLatLng();
        updateCoordinates(position.lat, position.lng);
        
        // Показываем popup с адресом
        if (currentAddress) {
          newMarker.bindPopup(`<b>Выбранное место:</b><br>${currentAddress}`).openPopup();
        }
      });

      // Обработчик клика по карте
      newMap.on('click', async function(e: any) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        newMarker.setLatLng([lat, lng]);
        updateCoordinates(lat, lng);
        
        // Показываем popup с адресом (будет обновлен в updateCoordinates)
        setTimeout(() => {
          if (currentAddress) {
            newMarker.bindPopup(`<b>Выбранное место:</b><br>${currentAddress}`).openPopup();
          }
        }, 1000); // Даем время получить адрес
      });

      setMap(newMap);
      setMarker(newMarker);

    } catch (error) {
      console.error('Ошибка инициализации карты:', error);
      setError('Ошибка при загрузке карты');
    }
  };

  // Открытие карты
  const openMapPicker = () => {
    setShowMap(true);
    if (!mapLoaded) {
      loadLeaflet();
    } else {
      setTimeout(initializeMap, 100);
    }
  };

  // Обновление позиции маркера
  useEffect(() => {
    if (marker && currentLat && currentLng) {
      marker.setLatLng([currentLat, currentLng]);
      if (map) {
        map.setView([currentLat, currentLng], map.getZoom());
      }
    }
  }, [currentLat, currentLng, marker, map]);

  // Закрытие карты
  const closeMap = () => {
    setShowMap(false);
    setSearchResults([]);
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
        setMap(null);
        setMarker(null);
      }
    };
  }, []);

  return (
    <div className={className}>
      {/* Поиск по адресу */}
      <div className="mb-4">
        <label className="block text-sm font-small text-gray-700 mb-1">
          Поиск по адресу
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchByAddress()}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Ташкент, улица Амира Темура..."
            />
            {/* Кнопка автозаполнения текущего адреса */}
            {currentAddress && currentAddress !== searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery(currentAddress)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Использовать текущий адрес"
              >
                📍
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={searchByAddress}
            disabled={searching}
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {searching ? '🔄' : '🔍'} {searching ? 'Ищу...' : 'Найти'}
          </button>
        </div>
        
        {/* Показываем текущий адрес под полем если он есть */}
        {currentAddress && (
          <div className="mt-1 text-xs text-gray-500">
            <span className="font-medium">Текущий адрес:</span> {currentAddress}
            {currentAddress !== searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery(currentAddress)}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                использовать
              </button>
            )}
          </div>
        )}
        
        {/* Результаты поиска */}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSearchResult(result)}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm font-medium text-gray-900 truncate">
                  {result.display_name}
                </div>
                <div className="text-xs text-gray-500">
                  {result.lat}, {result.lon}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          📍 Текущее местоположение
        </button>
        
        <button
          type="button"
          onClick={openMapPicker}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors"
        >
          🗺️ Выбрать на карте
        </button>
      </div>

      {/* Ручной ввод координат */}
      {showManualInput && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Широта
            </label>
            <input
              type="number"
              step="any"
              value={currentLat || ''}
              onChange={(e) => handleManualInput('latitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="41.2995"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Долгота
            </label>
            <input
              type="number"
              step="any"
              value={currentLng || ''}
              onChange={(e) => handleManualInput('longitude', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="69.2401"
            />
          </div>
        </div>
      )}

      {/* Ошибки */}
      {currentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {currentError}
        </div>
      )}

      {/* Модальное окно с картой */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] m-4 flex flex-col">
            {/* Заголовок */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">OpenStreetMap - Выбор местоположения</h3>
                <div className="text-sm text-green-600">✅ Полностью бесплатно!</div>
              </div>
              <button
                onClick={closeMap}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                type="button"
              >
                ×
              </button>
            </div>
            
            {/* Инструкция */}
            <div className="p-4 bg-blue-50 border-b">
              <div className="text-sm text-blue-700">
                <strong>Инструкция:</strong> Кликните на карту или перетащите красный маркер для выбора местоположения
              </div>
            </div>

            {/* Поиск */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchByAddress()}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Поиск места на карте..."
                  />
                  {/* Кнопка автозаполнения в модальном окне */}
                  {currentAddress && currentAddress !== searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery(currentAddress)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                      title="Использовать текущий адрес"
                    >
                      📍
                    </button>
                  )}
                </div>
                <button
                  onClick={searchByAddress}
                  disabled={searching}
                  type="button"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {searching ? '🔄 Ищу...' : '🔍 Найти'}
                </button>
              </div>
              
              {/* Показываем текущий адрес в модальном окне */}
              {currentAddress && (
                <div className="mt-2 text-xs text-gray-600 bg-white rounded px-2 py-1">
                  <span className="font-medium">📍 Текущий адрес:</span> {currentAddress}
                  {currentAddress !== searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery(currentAddress)}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      использовать
                    </button>
                  )}
                </div>
              )}
              
              {/* Результаты поиска в карте */}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded bg-white shadow max-h-32 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSearchResult(result)}
                      className="w-full text-left px-2 py-1 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Карта */}
            <div className="flex-1 p-4">
              <div 
                ref={mapRef}
                id={mapId.current}
                className="w-full h-96 rounded border"
                style={{ minHeight: '450px' }}
              ></div>
              {!mapLoaded && (
                <div className="w-full h-96 bg-gray-100 rounded border flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <div className="text-gray-600">Загрузка карты...</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Подвал */}
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <strong>Выбранные координаты:</strong><br/>
                Широта: {((currentLat && currentLat !== 0) ? currentLat : defaultLat)?.toFixed(6) || '0.000000'}<br/>
                Долгота: {((currentLng && currentLng !== 0) ? currentLng : defaultLng)?.toFixed(6) || '0.000000'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeMap}
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Отмена
                </button>
                <button
                  onClick={closeMap}
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✅ Применить координаты
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Добавляем декларацию для window.L
declare global {
  interface Window {
    L: any;
  }
}

export default LocationPicker;