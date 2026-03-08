/**
 * 寻村 - 智能位置匹配模块
 * 
 * 功能：
 * 1. GPS 定位获取当前位置
 * 2. 自动匹配最近的行政村
 * 3. 支持手动覆盖选择
 * 
 * 技术方案：
 * - 使用高德地图 API 获取 GPS 坐标
 * - 本地存储 1583 个行政村的坐标数据
 * - Haversine 公式计算距离
 */

// 行政村坐标库（示例数据，需要补充完整 1583 个村）
const VILLAGE_COORDS = [
    { name: '牛路村', region: '防城港市·防城区', lat: 21.65, lng: 108.35 },
    { name: '田心村', region: '防城港市·防城区', lat: 21.66, lng: 108.36 },
    { name: '竹山村', region: '防城港市·防城区', lat: 21.64, lng: 108.34 },
    { name: '丹桂村', region: '河池市·大化县', lat: 24.80, lng: 107.75 },
    { name: '南阳村', region: '南宁市·青秀区', lat: 22.85, lng: 108.45 },
    { name: '大明村', region: '梧州市·蒙山县', lat: 24.20, lng: 110.52 },
    { name: '那廖村', region: '南宁市·良庆区', lat: 22.70, lng: 108.35 },
    { name: '虾箩村', region: '防城港市·港口区', lat: 21.60, lng: 108.30 },
    // TODO: 补充完整 1583 个行政村的坐标数据
];

/**
 * Haversine 公式 - 计算两点间距离（单位：公里）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * 获取 GPS 定位并匹配最近村庄
 */
function autoMatchVillage() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('浏览器不支持 GPS 定位');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                // 查找最近的村庄
                let nearestVillage = null;
                let minDistance = Infinity;
                
                VILLAGE_COORDS.forEach(village => {
                    const distance = calculateDistance(
                        userLat, userLng,
                        village.lat, village.lng
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestVillage = {
                            ...village,
                            distance: distance.toFixed(2) // 公里
                        };
                    }
                });
                
                if (nearestVillage) {
                    resolve({
                        success: true,
                        village: nearestVillage,
                        userLocation: {
                            lat: userLat,
                            lng: userLng
                        }
                    });
                } else {
                    reject('未找到附近的村庄');
                }
            },
            (error) => {
                reject(`定位失败：${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

/**
 * 更新 UI - 自动填充位置和村庄
 */
function updateLocationUI(result) {
    if (result.success) {
        // 填充所在位置
        document.getElementById('locationValue').textContent = 
            `📍 当前位置（精度约${result.village.distance}km）`;
        document.getElementById('locationValue').style.color = '#333';
        
        // 填充所属村庄
        document.getElementById('villageValue').textContent = 
            `${result.village.region} · ${result.village.name}`;
        document.getElementById('villageValue').style.color = '#333';
        
        // 存储选中状态
        selectedLocation = {
            name: '当前位置',
            lat: result.userLocation.lat,
            lng: result.userLocation.lng
        };
        selectedVillage = result.village;
        
        toast(`已自动匹配：${result.village.name}（距离${result.village.distance}km）`);
    }
}

/**
 * 一键定位按钮事件
 */
async function handleOneClickLocation() {
    toast('正在定位并匹配村庄...');
    
    try {
        const result = await autoMatchVillage();
        updateLocationUI(result);
    } catch (error) {
        toast(error);
        // 定位失败，打开手动选择
        showLocationPicker();
    }
}

// 导出函数
window.autoMatchVillage = autoMatchVillage;
window.handleOneClickLocation = handleOneClickLocation;
