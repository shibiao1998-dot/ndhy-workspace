# 教育行业 API 设计特别指南

## 概览

教育行业 API 有独特的业务约束。本文档覆盖教育场景下的特殊设计要求：多角色权限 → 数据脱敏 → 系统对接 → 批量操作。

---

## 多角色权限模型

### 教育场景角色体系

教育系统通常涉及以下角色层级：

| 角色 | 层级 | 数据范围 | 典型操作 |
|------|------|---------|---------|
| **超级管理员** | 平台级 | 全部数据 | 系统配置、学校管理 |
| **学校管理员** | 学校级 | 本校数据 | 教师管理、课程审批 |
| **年级主任** | 年级级 | 本年级数据 | 班级管理、成绩汇总 |
| **教师** | 班级/课程级 | 所授课程+所管班级 | 教学管理、成绩录入 |
| **学生** | 个人级 | 自己的数据 | 学习、提交作业 |
| **家长** | 关联级 | 子女的数据 | 查看成绩、请假 |

### 权限设计要点

**1. 数据行级权限是核心**

教育系统的权限复杂度不在"能不能调这个接口"，而在"能看到/操作哪些数据"。

```yaml
# 同一个端点，不同角色看到不同范围的数据
GET /students:
  admin:    全校学生
  teacher:  自己班级的学生（可能跨多个班）
  parent:   自己绑定的子女
  student:  仅自己

GET /grades:
  admin:    全校成绩
  teacher:  自己课程的成绩
  student:  自己的成绩
  parent:   子女的成绩
```

**2. 同一操作的权限粒度不同**

```markdown
| 操作 | 教师权限 | 说明 |
|------|---------|------|
| 查看学生列表 | ✅ 本班级 | 自动按 class_id 过滤 |
| 编辑学生信息 | ❌ | 学生信息由管理员管理 |
| 录入成绩 | ✅ 本课程 | 只能录入自己教授课程的成绩 |
| 查看成绩统计 | ✅ 本课程 | 只看自己课程的统计 |
| 创建作业 | ✅ 本课程 | 只能为自己的课程创建 |
| 审批请假 | ✅ 本班级 | 班主任审批本班学生请假 |
```

**3. 权限矩阵模板（教育版）**

```markdown
| 端点 | super_admin | school_admin | teacher | student | parent |
|------|-------------|-------------|---------|---------|--------|
| GET /schools | ✅ 全部 | ✅ 本校 | ❌ | ❌ | ❌ |
| GET /classes | ✅ 全部 | ✅ 本校 | ✅ 本人相关 | ✅ 本班 | ✅ 子女班级 |
| GET /students | ✅ 全部 | ✅ 本校 | ✅ 本班 | ✅ 自己 | ✅ 子女 |
| POST /grades | ❌ | ❌ | ✅ 本课程 | ❌ | ❌ |
| GET /grades | ✅ 全部 | ✅ 本校 | ✅ 本课程 | ✅ 自己 | ✅ 子女 |
| POST /leaves | ❌ | ❌ | ❌ | ✅ 自己 | ✅ 子女 |
| PUT /leaves/{id}/approve | ❌ | ✅ | ✅ 本班 | ❌ | ❌ |
```

---

## 数据脱敏

### 教育数据敏感等级

| 敏感等级 | 数据类型 | 脱敏策略 |
|---------|---------|---------|
| **高** | 身份证号、家庭住址、联系电话、医疗信息 | 仅特定角色可见，API 默认不返回 |
| **中** | 成绩详情、考勤记录、行为记录 | 仅相关角色可见（教师/本人/家长） |
| **低** | 姓名、班级、学号 | 同校可见，校外脱敏 |

### 脱敏策略设计

**方案 1：字段级脱敏（推荐）**

```json
// 教师看到的学生信息
{
  "id": "stu_001",
  "name": "张小明",
  "student_no": "2025001",
  "phone": "138****5678",      // 部分脱敏
  "id_card": null,             // 不返回
  "address": null              // 不返回
}

// 管理员看到的学生信息
{
  "id": "stu_001",
  "name": "张小明",
  "student_no": "2025001",
  "phone": "13812345678",      // 完整信息
  "id_card": "110101200801****", // 部分脱敏
  "address": "北京市海淀区..."   // 完整信息
}
```

**方案 2：端点分离**

```
GET /students/{id}          → 基础信息（所有有权角色）
GET /students/{id}/private  → 敏感信息（仅管理员）
```

### 脱敏规则

| 字段类型 | 脱敏方式 | 示例 |
|---------|---------|------|
| 手机号 | 中间4位替换 | `138****5678` |
| 身份证 | 后4位替换 | `110101200801****` |
| 邮箱 | @前部分替换 | `z***@example.com` |
| 地址 | 只保留到区 | `北京市海淀区***` |
| 姓名 | 跨校场景替换 | `张*明` |

---

## 与教育系统对接

### 常见对接场景

| 对接系统 | 数据流向 | 典型接口 |
|---------|---------|---------|
| 教育局数据平台 | 双向 | 学生学籍同步、成绩上报 |
| 学校 OA/教务系统 | 双向 | 教师信息、课程表、排课 |
| 家校通/钉钉/企微 | 推送 | 通知、成绩报告、请假审批 |
| 第三方教学工具 | 拉取 | 学生名单、课程信息 |

### 对接 API 设计约束

**1. 稳定性要求极高**

教育系统对接通常涉及政府/学校的既有系统，变更周期长、容错空间小。

```
设计原则：
- 对接类接口必须版本化（URL 前缀 /v1/）
- 字段只增不减（除非走完整废弃流程）
- 提供转换层适配不同对端的数据格式
```

**2. 数据格式兼容**

```yaml
# 兼容不同对端的 ID 格式
student:
  properties:
    id:
      type: string
      description: "系统内部 ID"
    external_ids:
      type: object
      description: "外部系统 ID 映射"
      properties:
        edu_bureau_id:
          type: string
          description: "教育局学籍号"
        school_oa_id:
          type: string
          description: "学校 OA 系统学生 ID"
```

**3. 同步机制**

```markdown
| 同步方式 | 适用场景 | 说明 |
|---------|---------|------|
| **全量同步** | 首次对接、数据校准 | POST /sync/students/full |
| **增量同步** | 日常更新 | GET /students?updated_after={timestamp} |
| **Webhook 推送** | 实时通知 | 状态变更时推送到对端 |
| **手动导入** | 一次性批量 | POST /imports/students |
```

---

## 批量操作

### 教育场景常见批量操作

| 操作 | 场景 | 数据量 |
|------|------|--------|
| 批量导入学生 | 新学期录入 | 几十~几千条 |
| 批量录入成绩 | 考试后 | 几十~几百条 |
| 批量创建班级 | 学期初 | 几十条 |
| 批量分配课程 | 排课 | 几十~几百条 |
| 批量发送通知 | 家长通知 | 几十~几千条 |

### 批量操作 API 设计模式

**模式 1：同步批量（小数据量，< 100 条）**

```yaml
POST /students/batch:
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            items:
              type: array
              maxItems: 100
              items:
                $ref: '#/components/schemas/CreateStudentRequest'
  responses:
    200:
      description: "批量操作结果"
      content:
        application/json:
          schema:
            type: object
            properties:
              succeeded:
                type: integer
              failed:
                type: integer
              errors:
                type: array
                items:
                  type: object
                  properties:
                    index:
                      type: integer
                      description: "失败项在请求数组中的位置"
                    error:
                      $ref: '#/components/schemas/ErrorResponse'
```

**响应示例**：

```json
{
  "succeeded": 48,
  "failed": 2,
  "errors": [
    {
      "index": 12,
      "error": {
        "code": "DUPLICATE_STUDENT_NO",
        "message": "学号 2025013 已存在"
      }
    },
    {
      "index": 37,
      "error": {
        "code": "VALIDATION_FAILED",
        "message": "姓名不能为空"
      }
    }
  ]
}
```

**模式 2：异步批量（大数据量，> 100 条）**

```
步骤 1：提交任务
POST /imports/students
  Request: { file_url: "https://..." } 或 multipart/form-data
  Response: 202 Accepted
    { "task_id": "task_001", "status": "processing" }

步骤 2：轮询状态
GET /imports/tasks/{task_id}
  Response: 200
    {
      "task_id": "task_001",
      "status": "completed",      // processing / completed / failed
      "progress": { "total": 500, "processed": 500, "succeeded": 498, "failed": 2 },
      "result_url": "https://..."  // 详细结果下载链接
    }
```

### 批量操作设计规范

| 规范 | 说明 |
|------|------|
| **数量上限** | 同步批量有明确 maxItems（建议 100） |
| **部分失败处理** | 返回成功/失败数量 + 失败项详情 |
| **事务策略** | 明确是"全部成功或全部回滚"还是"尽量成功，报告失败" |
| **幂等** | 批量操作也需要幂等键 |
| **异步门槛** | 超过同步上限 → 返回 202 走异步 |
| **进度查询** | 异步操作提供进度查询端点 |

---

## 教育行业 API 检查附加项

在通用检查清单基础上，教育项目额外检查：

| # | 检查项 | 通过条件 |
|---|--------|---------|
| EDU-1 | 多角色权限覆盖 | 每个端点的权限矩阵覆盖了所有教育角色 |
| EDU-2 | 数据行级权限 | 教师/学生/家长的数据范围限制已设计 |
| EDU-3 | 敏感数据脱敏 | 身份证/手机/地址等敏感字段有脱敏策略 |
| EDU-4 | 批量操作上限 | 批量端点有 maxItems 限制 |
| EDU-5 | 外部系统 ID | 有 external_ids 字段支持多系统 ID 映射 |
| EDU-6 | 学期/学年维度 | 学期相关数据有时间范围过滤 |
| EDU-7 | 对接稳定性 | 对接类接口有版本号 + 字段只增不减 |
