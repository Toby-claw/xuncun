# 「寻村」微信小程序 - 技术实现方案

## 一、项目结构

```
xuncun-miniprogram/
├── app.js                      # 小程序入口
├── app.json                    # 全局配置
├── app.wxss                    # 全局样式
├── project.config.json         # 项目配置
├── cloudfunctions/             # 云函数(可选)
│   ├── login/
│   ├── order/
│   └── notify/
├── pages/
│   ├── index/                  # 首页(游客视角)
│   │   ├── index.js
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── village/                # 村庄详情
│   │   ├── detail.js
│   │   ├── detail.wxml
│   │   └── detail.wxss
│   ├── post/                   # 帖子相关
│   │   ├── list.js             # 帖子列表
│   │   ├── detail.js           # 帖子详情
│   │   └── publish.js          # 发布帖子
│   ├── product/                # 农产品
│   │   ├── list.js
│   │   ├── detail.js
│   │   └── publish.js          # 村民发布商品
│   ├── order/                  # 订单
│   │   ├── list.js
│   │   └── detail.js
│   ├── villager/               # 村民工作台
│   │   ├── dashboard.js        # 村民主页
│   │   ├── products.js         # 我的商品
│   │   ├── orders.js           # 我的订单
│   │   └── certification.js    # 认证申请
│   ├── admin/                  # 村管理员后台
│   │   ├── dashboard.js
│   │   ├── posts.js            # 内容管理
│   │   ├── villagers.js        # 村民管理
│   │   ├── stats.js            # 数据统计
│   │   └── notice-publish.js   # 发布公告
│   ├── user/                   # 个人中心
│   │   ├── center.js           # 我的(根据角色显示不同)
│   │   ├── profile.js          # 个人资料
│   │   ├── favorites.js        # 收藏
│   │   └── settings.js
│   └── common/                 # 通用页面
│       ├── webview.js
│       └── map.js
├── components/                 # 公共组件
│   ├── role-switcher/          # 角色切换器
│   ├── post-card/
│   ├── product-card/
│   ├── village-header/
│   ├── time-bg/                # 时间切换背景
│   ├── auth-modal/             # 授权弹窗
│   └── loading/
├── utils/
│   ├── api.js                  # API封装
│   ├── auth.js                 # 权限管理
│   ├── storage.js              # 本地存储
│   ├── time.js                 # 时间处理
│   └── validate.js             # 表单验证
└── constants/
    ├── roles.js                # 角色常量
    ├── status.js               # 状态常量
    └── config.js               # 全局配置
```

---

## 二、角色权限核心代码

### 1. 角色权限配置 (constants/roles.js)

```javascript
/**
 * 角色定义
 */
export const ROLES = {
  TOURIST: 'tourist',           // 游客
  VILLAGER: 'villager',         // 村民
  ADMIN: 'admin',               // 村管理员
  SUPER_ADMIN: 'super_admin'    // 平台运营
};

/**
 * 权限定义
 */
export const PERMISSIONS = {
  // 内容相关
  VIEW_POST: 'view:post',
  CREATE_POST: 'create:post',
  DELETE_POST: 'delete:post',
  TOP_POST: 'top:post',         // 置顶
  
  // 商品相关
  VIEW_PRODUCT: 'view:product',
  CREATE_PRODUCT: 'create:product',
  EDIT_PRODUCT: 'edit:product',
  DELETE_PRODUCT: 'delete:product',
  
  // 订单相关
  VIEW_ORDER: 'view:order',
  CREATE_ORDER: 'create:order',
  PROCESS_ORDER: 'process:order',
  
  // 管理相关
  VIEW_ADMIN: 'view:admin',
  MANAGE_VILLAGE: 'manage:village',
  MANAGE_VILLAGER: 'manage:villager',
  PUBLISH_NOTICE: 'publish:notice',
  
  // 系统相关
  VIEW_STATS: 'view:stats',
  MANAGE_PLATFORM: 'manage:platform'
};

/**
 * 角色权限映射
 */
export const ROLE_PERMISSIONS = {
  [ROLES.TOURIST]: [
    PERMISSIONS.VIEW_POST,
    PERMISSIONS.VIEW_PRODUCT,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.VIEW_ORDER  // 仅自己的订单
  ],
  
  [ROLES.VILLAGER]: [
    // 继承游客权限
    ...ROLE_PERMISSIONS[ROLES.TOURIST],
    // 村民特有
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.PROCESS_ORDER  // 处理自己的订单
  ],
  
  [ROLES.ADMIN]: [
    // 继承村民权限
    ...ROLE_PERMISSIONS[ROLES.VILLAGER],
    // 管理员特有
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.TOP_POST,
    PERMISSIONS.VIEW_ADMIN,
    PERMISSIONS.MANAGE_VILLAGE,
    PERMISSIONS.MANAGE_VILLAGER,
    PERMISSIONS.PUBLISH_NOTICE,
    PERMISSIONS.VIEW_STATS
  ],
  
  [ROLES.SUPER_ADMIN]: [
    // 所有权限
    ...Object.values(PERMISSIONS)
  ]
};

/**
 * 检查是否有权限
 */
export function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * 获取角色显示名称
 */
export function getRoleName(role) {
  const names = {
    [ROLES.TOURIST]: '游客',
    [ROLES.VILLAGER]: '村民',
    [ROLES.ADMIN]: '村管理员',
    [ROLES.SUPER_ADMIN]: '平台运营'
  };
  return names[role] || '未知';
}
```

### 2. 权限管理工具 (utils/auth.js)

```javascript
import { ROLES, ROLE_PERMISSIONS, hasPermission } from '../constants/roles';
import { getUserInfo } from './storage';

/**
 * 获取当前用户角色
 */
export function getCurrentRole() {
  const userInfo = getUserInfo();
  return userInfo?.role || ROLES.TOURIST;
}

/**
 * 检查当前用户是否有权限
 */
export function checkPermission(permission) {
  const role = getCurrentRole();
  return hasPermission(role, permission);
}

/**
 * 权限守卫 - 页面跳转前检查
 */
export function authGuard(requiredPermission, options = {}) {
  const { redirect = true, callback } = options;
  
  if (!checkPermission(requiredPermission)) {
    if (callback) {
      callback(false);
    }
    
    if (redirect) {
      const role = getCurrentRole();
      
      if (role === ROLES.TOURIST) {
        // 游客提示登录
        wx.showModal({
          title: '需要登录',
          content: '该功能需要登录后才能使用',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/user/login' });
            }
          }
        });
      } else {
        // 权限不足
        wx.showToast({
          title: '权限不足',
          icon: 'error'
        });
      }
    }
    
    return false;
  }
  
  if (callback) {
    callback(true);
  }
  
  return true;
}

/**
 * 根据角色获取首页路径
 */
export function getHomePageByRole() {
  const role = getCurrentRole();
  
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.SUPER_ADMIN:
      return '/pages/admin/dashboard';
    case ROLES.VILLAGER:
      return '/pages/villager/dashboard';
    default:
      return '/pages/index/index';
  }
}

/**
 * 角色切换逻辑
 * 注意: 实际切换需要后端验证身份
 */
export async function switchRole(targetRole) {
  const currentRole = getCurrentRole();
  
  // 降级不需要验证(管理员切游客)
  if (getRoleLevel(targetRole) <= getRoleLevel(currentRole)) {
    return true;
  }
  
  // 升级需要验证(游客切村民)
  // 这里调用后端API验证是否有资格
  const { result } = await wx.cloud.callFunction({
    name: 'auth',
    data: {
      action: 'checkRoleUpgrade',
      targetRole
    }
  });
  
  return result.canUpgrade;
}

function getRoleLevel(role) {
  const levels = {
    [ROLES.TOURIST]: 1,
    [ROLES.VILLAGER]: 2,
    [ROLES.ADMIN]: 3,
    [ROLES.SUPER_ADMIN]: 4
  };
  return levels[role] || 0;
}
```

### 3. 角色切换组件 (components/role-switcher/role-switcher.js)

```javascript
// components/role-switcher/role-switcher.js
import { ROLES, getRoleName } from '../../constants/roles';
import { getCurrentRole, switchRole } from '../../utils/auth';

Component({
  data: {
    currentRole: '',
    currentRoleName: '',
    showSwitchPanel: false,
    availableRoles: []
  },
  
  lifetimes: {
    attached() {
      this.updateRoleInfo();
    }
  },
  
  methods: {
    updateRoleInfo() {
      const currentRole = getCurrentRole();
      const availableRoles = this.getAvailableRoles();
      
      this.setData({
        currentRole,
        currentRoleName: getRoleName(currentRole),
        availableRoles
      });
    },
    
    getAvailableRoles() {
      const currentRole = getCurrentRole();
      const allRoles = [
        { value: ROLES.TOURIST, name: '游客', icon: '👀' },
        { value: ROLES.VILLAGER, name: '村民', icon: '🏠' },
        { value: ROLES.ADMIN, name: '管理员', icon: '👨‍💼' }
      ];
      
      // 根据当前角色返回可切换的角色列表
      switch (currentRole) {
        case ROLES.SUPER_ADMIN:
          return allRoles;
        case ROLES.ADMIN:
          return allRoles.filter(r => r.value !== ROLES.SUPER_ADMIN);
        case ROLES.VILLAGER:
          return allRoles.filter(r => r.value !== ROLES.ADMIN && r.value !== ROLES.SUPER_ADMIN);
        default:
          return allRoles.filter(r => r.value === ROLES.TOURIST);
      }
    },
    
    togglePanel() {
      this.setData({
        showSwitchPanel: !this.data.showSwitchPanel
      });
    },
    
    async onSelectRole(e) {
      const { role } = e.currentTarget.dataset;
      
      if (role === this.data.currentRole) {
        this.togglePanel();
        return;
      }
      
      // 检查是否可以切换
      const canSwitch = await switchRole(role);
      
      if (!canSwitch) {
        if (role === ROLES.VILLAGER) {
          wx.navigateTo({
            url: '/pages/villager/certification'
          });
        } else if (role === ROLES.ADMIN) {
          wx.showToast({
            title: '请联系平台申请',
            icon: 'none'
          });
        }
        this.togglePanel();
        return;
      }
      
      // 切换角色
      this.setData({ currentRole: role });
      this.triggerEvent('roleChange', { role });
      this.togglePanel();
      
      // 跳转到对应首页
      const pages = {
        [ROLES.TOURIST]: '/pages/index/index',
        [ROLES.VILLAGER]: '/pages/villager/dashboard',
        [ROLES.ADMIN]: '/pages/admin/dashboard'
      };
      
      wx.switchTab({
        url: pages[role] || '/pages/index/index'
      });
    }
  }
});
```

---

## 三、关键页面实现

### 1. 个人中心 - 根据角色显示不同 (pages/user/center.js)

```javascript
// pages/user/center.js
import { ROLES, getRoleName } from '../../constants/roles';
import { getCurrentRole } from '../../utils/auth';

Page({
  data: {
    userInfo: null,
    role: '',
    roleName: '',
    menuList: []
  },
  
  onShow() {
    this.loadUserInfo();
    this.generateMenuByRole();
  },
  
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const role = getCurrentRole();
    
    this.setData({
      userInfo,
      role,
      roleName: getRoleName(role)
    });
  },
  
  generateMenuByRole() {
    const role = this.data.role;
    let menuList = [];
    
    // 公共菜单
    const commonMenus = [
      { icon: '⭐', title: '我的收藏', url: '/pages/user/favorites' },
      { icon: '⏰', title: '浏览历史', url: '/pages/user/history' },
      { icon: '⚙️', title: '设置', url: '/pages/user/settings' }
    ];
    
    switch (role) {
      case ROLES.VILLAGER:
        menuList = [
          { icon: '📊', title: '工作台', url: '/pages/villager/dashboard', highlight: true },
          { icon: '📦', title: '我的商品', url: '/pages/villager/products' },
          { icon: '📋', title: '我的订单', url: '/pages/villager/orders', badge: 3 },
          { icon: '📝', title: '我的帖子', url: '/pages/villager/posts' },
          { icon: '💰', title: '收益统计', url: '/pages/villager/income' },
          ...commonMenus
        ];
        break;
        
      case ROLES.ADMIN:
        menuList = [
          { icon: '📊', title: '管理后台', url: '/pages/admin/dashboard', highlight: true },
          { icon: '🏘️', title: '村庄管理', url: '/pages/admin/village' },
          { icon: '👥', title: '村民管理', url: '/pages/admin/villagers' },
          { icon: '📝', title: '内容审核', url: '/pages/admin/posts', badge: 5 },
          { icon: '📢', title: '发布公告', url: '/pages/admin/notice-publish' },
          { icon: '📈', title: '数据统计', url: '/pages/admin/stats' },
          ...commonMenus
        ];
        break;
        
      default: // 游客
        menuList = [
          { icon: '📍', title: '我的订单', url: '/pages/order/list' },
          { icon: '✍️', title: '我的游记', url: '/pages/post/my-posts' },
          { icon: '🏠', title: '申请成为村民', url: '/pages/villager/certification', highlight: true },
          ...commonMenus
        ];
    }
    
    this.setData({ menuList });
  }
});
```

### 2. 时间切换背景组件升级 (components/time-bg/time-bg.js)

```javascript
// components/time-bg/time-bg.js
Component({
  properties: {
    villageId: String,
    images: {
      type: Object,
      value: {
        dawn: '/images/bg-dawn.jpg',
        daytime: '/images/bg-daytime.jpg',
        dusk: '/images/bg-dusk.jpg',
        night: '/images/bg-night.jpg'
      }
    }
  },
  
  data: {
    currentBg: '',
    currentPeriod: '',
    periodName: ''
  },
  
  lifetimes: {
    attached() {
      this.updateBackground();
      // 每分钟检查一次
      this.timer = setInterval(() => {
        this.updateBackground();
      }, 60000);
    },
    
    detached() {
      clearInterval(this.timer);
    }
  },
  
  methods: {
    updateBackground() {
      const hour = new Date().getHours();
      let period, bg, name;
      
      if (hour >= 5 && hour < 8) {
        period = 'dawn';
        name = '清晨';
        bg = this.properties.images.dawn;
      } else if (hour >= 8 && hour < 17) {
        period = 'daytime';
        name = '白天';
        bg = this.properties.images.daytime;
      } else if (hour >= 17 && hour < 20) {
        period = 'dusk';
        name = '黄昏';
        bg = this.properties.images.dusk;
      } else {
        period = 'night';
        name = '夜晚';
        bg = this.properties.images.night;
      }
      
      // 只有当时段变化时才更新
      if (period !== this.data.currentPeriod) {
        this.setData({
          currentBg: bg,
          currentPeriod: period,
          periodName: name
        });
        
        // 触发事件
        this.triggerEvent('periodChange', {
          period,
          name,
          hour
        });
      }
    }
  }
});
```

---

## 四、后端 API 设计

### 1. 用户相关

```
POST /api/auth/login          # 微信登录
GET  /api/auth/role           # 获取当前角色
POST /api/auth/switch-role    # 切换角色(需验证)
POST /api/auth/certification  # 提交认证申请
```

### 2. 村庄相关

```
GET  /api/villages            # 村庄列表(搜索/筛选)
GET  /api/villages/:id        # 村庄详情
GET  /api/villages/:id/stats  # 村庄统计数据
POST /api/villages            # 创建村庄(超管)
PUT  /api/villages/:id        # 更新村庄信息
```

### 3. 内容相关

```
GET    /api/posts             # 帖子列表
GET    /api/posts/:id         # 帖子详情
POST   /api/posts             # 发布帖子
DELETE /api/posts/:id         # 删除帖子
POST   /api/posts/:id/like    # 点赞
POST   /api/posts/:id/top     # 置顶(管理员)
```

### 4. 商品相关

```
GET    /api/products          # 商品列表
GET    /api/products/:id      # 商品详情
POST   /api/products          # 发布商品(村民)
PUT    /api/products/:id      # 更新商品
DELETE /api/products/:id      # 删除商品
```

### 5. 订单相关

```
GET  /api/orders              # 订单列表
GET  /api/orders/:id          # 订单详情
POST /api/orders              # 创建订单
PUT  /api/orders/:id/pay      # 支付
PUT  /api/orders/:id/ship     # 发货(村民)
PUT  /api/orders/:id/complete # 确认收货
```

---

## 五、部署架构

```
生产环境:
┌─────────────────────────────────────────────────────────────┐
│                      微信小程序                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                     Nginx (负载均衡)                         │
└────────────┬─────────────────────────────┬──────────────────┘
             │                             │
┌────────────▼────────┐        ┌───────────▼──────────┐
│   Node.js服务 x2    │        │   Node.js服务 x2     │
│   (应用服务器)      │        │   (应用服务器)       │
└────────────┬────────┘        └───────────┬──────────┘
             │                             │
             └────────────┬────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    MySQL 主从集群                            │
└─────────────────────────────────────────────────────────────┘
```

---

> 下一步: 搭建开发环境，从第一个API开始实现！
