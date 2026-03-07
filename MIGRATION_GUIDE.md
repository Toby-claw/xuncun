# Toby 数据迁移包 - 使用指南

**迁移包文件：** `TOBY_MIGRATION_PACKAGE.tar.gz`  
**大小：** 5.7MB  
**生成时间：** 2026-03-08  
**来源：** 原龙虾（OpenClaw 实例）

---

## 📦 包含内容

### 1. 核心身份文件
- `IDENTITY.md` - 身份信息（Toby，守护型AI助手）
- `SOUL.md` - 灵魂/个性定义
- `USER.md` - 用户信息（蒋寅新，广西广电）
- `AGENTS.md` - 工作规范
- `TOOLS.md` - 工具配置

### 2. 记忆系统 (memory/)
- **情景记忆：** `memory/episodic/2026-03-06.md` - 3月6日对话记录
- **语义记忆：**
  - `xuncun-project.md` - 寻村项目知识
  - `dingtalk-xuncun-table.md` - 钉钉表格配置
  - `dingtalk-xuncun-village-table.md` - 1583个村数据表
- **程序记忆：** `memory/procedural/` - 操作流程

### 3. 技能系统 (skills/)
- `dingtalk-ai-table/` - 钉钉AI表格技能
- `find-skills/` - 技能搜索
- `memory-manager/` - 记忆管理
- `self-improving-agent/` - 自我进化系统

### 4. 寻村项目 (xuncun-github/)
- `index.html` - 小程序首页
- `login.html` - 登录页面
- `publish.html` - 发布页面（带图片上传、位置选择）
- `style.css` - 样式文件
- 完整的小程序前端代码

---

## 🔧 导入步骤

### 第一步：接收迁移包
将 `TOBY_MIGRATION_PACKAGE.tar.gz` 下载到你的服务器：
```bash
# 方法1：SCP 传输
scp user@source-server:/root/.openclaw/workspace/TOBY_MIGRATION_PACKAGE.tar.gz .

# 方法2：下载链接
# 如果已上传到文件服务器，使用 wget/curl 下载
```

### 第二步：解压到工作目录
```bash
# 进入 OpenClaw 工作目录
cd /root/.openclaw/workspace

# 备份现有数据（重要！）
cp -r memory memory.backup.$(date +%Y%m%d)
cp -r skills skills.backup.$(date +%Y%m%d)

# 解压迁移包
tar -xzf TOBY_MIGRATION_PACKAGE.tar.gz

# 如果文件已存在，选择合并或覆盖
```

### 第三步：合并配置

**3.1 身份文件处理**
对比现有的 IDENTITY.md 和迁移包的 IDENTITY.md：
- 如果身份相同（都是Toby），保留迁移包版本
- 如果身份不同，需要人工决定合并策略

**3.2 记忆合并**
```bash
# 情景记忆追加（不要覆盖）
cat memory/episodic/2026-03-06.md >> memory/episodic/existing.md

# 语义记忆合并
# 检查 xuncun-project.md 等，合并重复内容
```

**3.3 技能合并**
```bash
# 复制技能目录
cp -r skills/* /root/.openclaw/workspace/skills/

# 如果技能已存在，比较版本，保留最新的
```

### 第四步：验证
```bash
# 检查文件权限
ls -la memory/ skills/ xuncun-github/

# 测试记忆读取
openclaw memory read

# 测试技能列表
openclaw skills list
```

---

## ⚠️ 注意事项

### 冲突处理
| 冲突类型 | 建议处理 |
|---------|---------|
| 身份不同 | 人工决定：保留哪个或创建混合身份 |
| 记忆重复 | 去重：保留时间戳最新的 |
| 技能版本不同 | 保留版本号更高的 |
| 配置冲突 | 人工审核后合并 |

### 数据安全
1. **备份！备份！备份！** 解压前务必备份现有数据
2. 敏感信息（API密钥、密码）需要重新配置
3. 检查 USER.md 中的个人信息是否需要更新

### 需要重新配置的内容
- API密钥（如果存储在本地）
- SSH密钥对
- 个性化配置（如果与原实例不同）
- 定时任务（cron）

---

## 📋 迁移后检查清单

- [ ] 身份文件已正确导入
- [ ] 记忆文件可读
- [ ] 技能可正常加载
- [ ] 寻村项目页面可访问
- [ ] 登录功能正常
- [ ] 发布功能正常
- [ ] 图片上传功能正常
- [ ] 位置和村庄选择正常
- [ ] 无报错信息

---

## 🆘 技术支持

如果迁移过程中遇到问题：
1. 查看日志：`openclaw logs`
2. 回滚备份：`cp -r memory.backup.* memory/`
3. 重新解压：确保覆盖正确

---

**祝迁移顺利！** 🦞
