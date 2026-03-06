# 🏡 「寻村」微信小程序 - 产品规划蓝图

> 让全国的人走进广西乡村，让村民生活得更好

---

## 一、产品定位与愿景

### 核心使命
连接城市与乡村，让游客发现真实的乡村之美，让村民通过数字化工具获得实实在在的收益。

### 目标用户
| 角色 | 核心需求 | 使用场景 |
|------|----------|----------|
| **游客** | 发现乡村、规划行程、深度体验 | 周末游、亲子游、摄影、乡村美食 |
| **村民** | 展示自家产品、获得收入、参与村务 | 卖农产品、做民宿、接游客 |
| **村管理员** | 推广本村、管理村务、服务村民 | 发布公告、审核内容、统计营收 |
| **平台运营** | 管理多村、数据分析、商业变现 | 推广运营、商务合作、数据监控 |

---

## 二、角色权限体系设计

### 权限矩阵

```
┌─────────────────────────────────────────────────────────────┐
│ 功能模块          │ 游客 │ 村民 │ 村管理员 │ 平台运营 │
├─────────────────────────────────────────────────────────────┤
│ 浏览村庄信息      │  ✅  │  ✅  │    ✅    │    ✅    │
│ 查看公告/游记     │  ✅  │  ✅  │    ✅    │    ✅    │
│ 收藏/点赞/评论    │  ✅  │  ✅  │    ✅    │    ✅    │
│ 发布游记/打卡     │  ✅  │  ✅  │    ✅    │    ✅    │
├─────────────────────────────────────────────────────────────┤
│ 发布农产品        │  ❌  │  ✅  │    ✅    │    ✅    │
│ 管理自家商品      │  ❌  │  ✅  │    ✅    │    ✅    │
│ 接单/处理订单     │  ❌  │  ✅  │    ✅    │    ✅    │
│ 申请成为村民      │  ❌  │  ✅  │    ✅    │    ✅    │
├─────────────────────────────────────────────────────────────┤
│ 发布官方公告      │  ❌  │  ❌  │    ✅    │    ✅    │
│ 审核村民申请      │  ❌  │  ❌  │    ✅    │    ✅    │
│ 管理本村内容      │  ❌  │  ❌  │    ✅    │    ✅    │
│ 查看本村数据      │  ❌  │  ❌  │    ✅    │    ✅    │
├─────────────────────────────────────────────────────────────┤
│ 添加新村庄        │  ❌  │  ❌  │    ❌    │    ✅    │
│ 平台数据统计      │  ❌  │  ❌  │    ❌    │    ✅    │
│ 全局内容审核      │  ❌  │  ❌  │    ❌    │    ✅    │
│ 商业合作管理      │  ❌  │  ❌  │    ❌    │    ✅    │
└─────────────────────────────────────────────────────────────┘
```

### 角色认证机制

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    游客     │───▶│   注册登录   │───▶│   实名认证   │
│ (微信授权)  │    │ (微信一键)   │    │ (身份验证)   │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
            ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
            │    村民     │          │  村管理员   │          │  平台运营   │
            │ 身份证+定位 │          │ 村委授权书  │          │ 后台配置    │
            │ 人脸识别    │          │ 政府证明    │          │             │
            └─────────────┘          └─────────────┘          └─────────────┘
```

---

## 三、技术架构设计

### 整体架构

```
┌────────────────────────────────────────────────────────────────────┐
│                         微信小程序端                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ 游客首页 │ │ 村民工作台│ │ 管理后台 │ │ 个人中心 │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
└──────────────────────────────┬─────────────────────────────────────┘
                               │ HTTPS/WSS
┌──────────────────────────────▼─────────────────────────────────────┐
│                         API 网关层                                 │
│              鉴权/限流/日志/路由/API版本管理                        │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼──────┐    ┌──────────▼──────────┐  ┌──────▼──────┐
│   业务服务    │    │      数据存储        │  │  第三方服务  │
│ ┌──────────┐ │    │  ┌───────────────┐  │  │ ┌─────────┐ │
│ │ 用户服务  │ │    │  │   MySQL       │  │  │ │微信支付 │ │
│ │ 村庄服务  │ │    │  │  (主数据库)   │  │  │ │微信登录 │ │
│ │ 内容服务  │ │    │  └───────────────┘  │  │ │地图服务 │ │
│ │ 商品服务  │ │    │  ┌───────────────┐  │  │ │短信服务 │ │
│ │ 订单服务  │ │    │  │   Redis       │  │  │ │OSS存储 │ │
│ │ 消息服务  │ │    │  │  (缓存/会话)  │  │  │ └─────────┘ │
│ └──────────┘ │    │  └───────────────┘  │  └─────────────┘
└──────────────┘    │  ┌───────────────┐  │
                    │  │ Elasticsearch │  │
                    │  │  (全文搜索)   │  │
                    │  └───────────────┘  │
                    └─────────────────────┘
```

### 技术选型

| 层级 | 技术方案 | 说明 |
|------|----------|------|
| **前端** | 微信小程序原生 + Taro(可选) | 快速开发、跨平台能力 |
| **后端** | Node.js + Koa / Go + Gin | 高性能、高并发 |
| **数据库** | MySQL 8.0 + Redis | 主从架构、读写分离 |
| **搜索** | Elasticsearch | 村庄/内容搜索 |
| **文件存储** | 阿里云OSS / 腾讯云COS | 图片、视频存储 |
| **消息队列** | RabbitMQ | 异步任务处理 |
| **运维** | Docker + K8s | 容器化部署 |

---

## 四、数据库核心表设计

### 用户体系
```sql
-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(64) UNIQUE NOT NULL,          -- 微信openid
    unionid VARCHAR(64),                          -- 微信unionid
    phone VARCHAR(20),                            -- 手机号
    nickname VARCHAR(64),                         -- 昵称
    avatar_url VARCHAR(255),                      -- 头像
    role ENUM('tourist', 'villager', 'admin', 'super_admin') DEFAULT 'tourist',
    status TINYINT DEFAULT 1,                     -- 0禁用 1正常
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 村民认证表
CREATE TABLE villager_certifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    village_id BIGINT NOT NULL,
    real_name VARCHAR(64),                        -- 真实姓名
    id_card VARCHAR(18),                          -- 身份证号
    id_card_front VARCHAR(255),                   -- 身份证正面
    id_card_back VARCHAR(255),                    -- 身份证反面
    address VARCHAR(255),                         -- 详细住址
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    verified_by BIGINT,                           -- 审核人
    verified_at TIMESTAMP,                        -- 审核时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 管理员表
CREATE TABLE village_admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    village_id BIGINT NOT NULL,
    position VARCHAR(64),                         -- 职位(村支书/主任等)
    certificate_url VARCHAR(255),                 -- 任命书/证明
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 村庄体系
```sql
-- 村庄表
CREATE TABLE villages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(128) NOT NULL,                   -- 村庄名称
    province VARCHAR(64),                         -- 省
    city VARCHAR(64),                             -- 市
    district VARCHAR(64),                         -- 区/县
    address VARCHAR(255),                         -- 详细地址
    longitude DECIMAL(10, 7),                     -- 经度
    latitude DECIMAL(10, 7),                      -- 纬度
    cover_images JSON,                            -- 封面图数组
    description TEXT,                             -- 村庄介绍
    tags JSON,                                    -- 标签[梯田,民宿,美食]
    features JSON,                                -- 特色数据{民宿:3,美食:5}
    view_count INT DEFAULT 0,                     -- 浏览量
    like_count INT DEFAULT 0,                     -- 点赞数
    status TINYINT DEFAULT 1,                     -- 0未上线 1正常 2推荐
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 村庄统计表(每日汇总)
CREATE TABLE village_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    village_id BIGINT NOT NULL,
    stat_date DATE NOT NULL,
    visitor_count INT DEFAULT 0,                  -- 访客数
    post_count INT DEFAULT 0,                     -- 新增帖子数
    order_count INT DEFAULT 0,                    -- 订单数
    revenue DECIMAL(10, 2) DEFAULT 0,             -- 营收
    UNIQUE KEY uk_village_date (village_id, stat_date)
);
```

### 内容体系
```sql
-- 帖子/游记表
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    village_id BIGINT NOT NULL,
    type ENUM('travel', 'notice', 'product', 'activity') DEFAULT 'travel',
    title VARCHAR(255),
    content TEXT,                                 -- 内容
    images JSON,                                  -- 图片数组
    location VARCHAR(255),                        -- 定位地点
    longitude DECIMAL(10, 7),
    latitude DECIMAL(10, 7),
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected', 'deleted') DEFAULT 'approved',
    is_top TINYINT DEFAULT 0,                     -- 是否置顶
    top_expire_at TIMESTAMP,                      -- 置顶过期时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT DEFAULT 0,                   -- 回复的评论ID
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 电商体系
```sql
-- 商品表
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,                      -- 卖家(村民)
    village_id BIGINT NOT NULL,
    category_id INT,                              -- 分类ID
    name VARCHAR(255) NOT NULL,                   -- 商品名
    description TEXT,                             -- 描述
    images JSON,                                  -- 图片
    price DECIMAL(10, 2) NOT NULL,                -- 单价
    unit VARCHAR(32),                             -- 单位(斤/个/份)
    stock INT DEFAULT 0,                          -- 库存
    sold_count INT DEFAULT 0,                     -- 销量
    status TINYINT DEFAULT 1,                     -- 0下架 1上架
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) UNIQUE NOT NULL,         -- 订单号
    buyer_id BIGINT NOT NULL,                     -- 买家
    seller_id BIGINT NOT NULL,                    -- 卖家
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,                        -- 数量
    total_amount DECIMAL(10, 2),                  -- 总价
    remark VARCHAR(255),                          -- 备注
    contact_name VARCHAR(64),                     -- 联系人
    contact_phone VARCHAR(20),                    -- 电话
    contact_address VARCHAR(255),                 -- 地址
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    paid_at TIMESTAMP,                            -- 支付时间
    shipped_at TIMESTAMP,                         -- 发货时间
    completed_at TIMESTAMP,                       -- 完成时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 五、核心功能模块

### Phase 1: MVP 基础版 (2-3个月)

```
┌────────────────────────────────────────────────────────────┐
│  1. 用户系统                                                │
│     ├── 微信一键登录                                        │
│     ├── 游客模式                                            │
│     └── 村民申请认证(简化版)                                 │
├────────────────────────────────────────────────────────────┤
│  2. 村庄展示                                                │
│     ├── 村庄列表/搜索                                       │
│     ├── 村庄详情页                                          │
│     └── 时间切换背景图(已做)                                 │
├────────────────────────────────────────────────────────────┤
│  3. 内容社区                                                │
│     ├── 发布游记/图文                                       │
│     ├── 点赞/评论                                           │
│     └── 村公告(仅管理员)                                     │
├────────────────────────────────────────────────────────────┤
│  4. 农产品交易(简化)                                         │
│     ├── 发布农产品                                          │
│     ├── 微信支付下单                                        │
│     └── 订单管理                                            │
└────────────────────────────────────────────────────────────┘
```

### Phase 2: 成长版 (3-4个月)

```
┌────────────────────────────────────────────────────────────┐
│  1. 角色体系完善                                            │
│     ├── 完整的村民认证流程                                   │
│     ├── 村管理员后台                                         │
│     └── 权限细分                                            │
├────────────────────────────────────────────────────────────┤
│  2. 民宿预订                                                │
│     ├── 民宿入驻                                            │
│     ├── 在线预订/支付                                        │
│     └── 日历管理                                            │
├────────────────────────────────────────────────────────────┤
│  3. 乡村旅游                                                │
│     ├── 游玩路线推荐                                         │
│     ├── 打卡点导航                                          │
│     └── AR导览(可选)                                        │
├────────────────────────────────────────────────────────────┤
│  4. 数据看板                                                │
│     ├── 村庄数据概览                                         │
│     ├── 村民收益统计                                         │
│     └── 游客画像                                            │
└────────────────────────────────────────────────────────────┘
```

### Phase 3: 生态版 (6个月+)

```
┌────────────────────────────────────────────────────────────┐
│  1. 社交功能                                                │
│     ├── 关注/粉丝系统                                       │
│     ├── 私信聊天                                            │
│     └── 村民圈子                                            │
├────────────────────────────────────────────────────────────┤
│  2. 内容变现                                                │
│     ├── 付费内容(攻略)                                       │
│     ├── 直播带货                                            │
│     └── 打赏系统                                            │
├────────────────────────────────────────────────────────────┤
│  3. 智慧乡村                                                │
│     ├── 村务公开投票                                         │
│     ├── 积分兑换系统                                         │
│     └── 物联网接入(环境监测)                                 │
├────────────────────────────────────────────────────────────┤
│  4. 商业拓展                                                │
│     ├── 广告系统                                            │
│     ├── 旅行社合作                                          │
│     └── 农产品溯源                                          │
└────────────────────────────────────────────────────────────┘
```

---

## 六、商业模式

### 收入来源

| 模式 | 说明 | 预期占比 |
|------|------|----------|
| **交易佣金** | 农产品/民宿订单抽成 3-5% | 60% |
| **广告收入** | 村庄推广、商家广告 | 20% |
| **增值服务** | 村庄置顶、精准推送、数据报告 | 15% |
| **政府合作** | 数字乡村建设项目 | 5% |

### 成本结构

```
固定成本:
├── 服务器/云服务 (¥5,000-10,000/月)
├── 团队工资 (¥80,000-150,000/月)
├── 办公场地 (¥10,000/月)
└── 第三方服务 (¥3,000/月)

变动成本:
├── 推广费用 (按获客成本)
├── 支付通道费 (0.6%)
└── 客服/运维 (按订单量)
```

---

## 七、风险与对策

| 风险 | 对策 |
|------|------|
| 村民数字化能力弱 | 线下培训、简化操作、村委协助 |
| 产品质量不可控 | 实名认证、评价系统、先行赔付 |
| 物流配送难题 | 与本地快递合作、自提点模式 |
| 内容审核压力 | AI预审+人工复审+举报机制 |
| 同质化竞争 | 深耕广西、文化差异化、政府背书 |

---

## 八、下一步行动清单

### 本周要完成
- [ ] 确定技术团队/外包方案
- [ ] 注册公司/小程序账号
- [ ] 选择第一个试点村庄

### 本月要完成
- [ ] 完成UI设计稿
- [ ] 搭建开发环境
- [ ] 数据库设计评审

### 本季度要完成
- [ ] MVP版本上线
- [ ] 1个村庄试点运营
- [ ] 获取第一批种子用户

---

> 🎯 **核心理念**: 先做深一个村庄，验证模式后再复制。让簕山古渔村成为样板！
