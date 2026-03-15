# 教育行业后端实现特别指南

教育行业后端实现的特殊约束和实现模式。

> 教育系统的核心特殊性：多角色权限、学生数据隐私、批量操作性能、外部系统对接。

---

## 多角色权限实现

### 教育系统角色体系

| 角色 | 典型权限 | 数据范围 |
|------|---------|---------|
| **超级管理员** | 全部功能 | 全部数据 |
| **学校管理员** | 本校管理功能 | 本校数据 |
| **年级主任** | 年级管理功能 | 本年级数据 |
| **班主任** | 班级管理 + 学生管理 | 本班数据 |
| **任课教师** | 课程管理 + 成绩管理 | 所授课程和班级数据 |
| **学生** | 查看自己的数据 | 仅自己的数据 |
| **家长** | 查看孩子的数据 | 仅关联孩子的数据 |

### 权限实现模式

#### 功能权限：基于角色

```
// 角色-功能权限映射
ADMIN:    [全部]
TEACHER:  [查看学生, 录入成绩, 管理课程, 发布作业]
STUDENT:  [查看成绩, 提交作业, 查看课表]
PARENT:   [查看成绩, 查看出勤, 联系教师]
```

#### 数据权限：基于关联关系

```
func GetStudentList(query, currentUser):
    switch currentUser.role:
        case ADMIN:
            // 不限制
        case SCHOOL_ADMIN:
            query.schoolId = currentUser.schoolId
        case GRADE_DIRECTOR:
            query.gradeId = currentUser.gradeId
        case TEACHER:
            query.classIds = currentUser.teachingClassIds
        case CLASS_TEACHER:
            query.classId = currentUser.classId
        case PARENT:
            query.studentIds = currentUser.childStudentIds
        case STUDENT:
            query.studentId = currentUser.studentId
```

#### 特殊权限场景

| 场景 | 实现方式 |
|------|---------|
| 教师只能修改自己所授课程的成绩 | Service 层检查 `course.teacherId == currentUser.id` |
| 家长只能查看自己孩子的数据 | Repository 查询加 `studentId IN (childStudentIds)` |
| 成绩发布后学生才能查看 | Service 层检查 `score.isPublished == true` |
| 临时授权（代课教师） | 支持角色临时扩展 + 过期时间 |

### 权限检查清单

- [ ] 每个接口标注了所需角色
- [ ] 数据查询有角色相关的范围过滤
- [ ] 跨角色操作（教师查其他班）被拦截
- [ ] 学生不能修改自己的成绩
- [ ] 家长只能看到自己孩子的数据
- [ ] 角色变更后权限立即生效

---

## 隐私合规实现

### 学生数据保护原则

| 原则 | 实现 |
|------|------|
| **最小化收集** | 只收集业务必需的数据字段 |
| **目的限制** | 数据只用于收集时声明的目的 |
| **访问控制** | 严格按角色控制数据可见性 |
| **审计追踪** | 关键数据访问和修改有日志 |
| **脱敏展示** | 非必要场景脱敏展示敏感字段 |
| **数据导出** | 支持家长/学生导出个人数据 |

### 敏感数据处理

| 数据类型 | 存储方式 | 展示方式 | 日志方式 |
|---------|---------|---------|---------|
| 学生姓名 | 明文存储 | 完整展示 | 可记录 |
| 身份证号 | 加密存储 | 中间脱敏 `110***1234` | 脱敏记录 |
| 家长手机 | 明文存储 | 中间脱敏 `138****5678` | 脱敏记录 |
| 家庭住址 | 明文存储 | 仅管理员可见 | 不记录 |
| 成绩数据 | 明文存储 | 按权限可见 | 访问记录 |
| 健康信息 | 加密存储 | 仅授权角色可见 | 脱敏 + 审计 |

### 审计日志实现

```
// 关键操作审计
func auditLog(action, targetType, targetId, details, operator):
    log = AuditLog(
        action: action,           // "VIEW_SCORE", "UPDATE_GRADE", "EXPORT_DATA"
        targetType: targetType,   // "STUDENT", "SCORE", "ATTENDANCE"
        targetId: targetId,       // 被操作对象 ID
        details: details,         // 操作详情（脱敏后）
        operatorId: operator.id,
        operatorRole: operator.role,
        ip: request.remoteIp,
        timestamp: now()
    )
    auditRepo.save(log)
```

需要审计的操作：
- 查看学生个人信息
- 修改学生成绩
- 导出学生数据
- 批量操作（批量修改成绩/导入学生）
- 权限变更

---

## 批量操作性能优化

### 常见批量场景

| 场景 | 数据量 | 性能要求 |
|------|--------|---------|
| 批量导入学生 | 几十~几千条 | 可异步，需进度反馈 |
| 批量录入成绩 | 一个班 40-60 条 | 同步，秒级响应 |
| 批量导出成绩单 | 一个年级几百~几千 | 可异步，需下载链接 |
| 批量发送通知 | 几十~几千条 | 异步 |
| 学期初批量分班 | 几百条 | 可异步，需事务保证 |

### 批量实现模式

#### 小批量同步（< 100 条）

```
func BatchUpdateScores(scores):
    validate(scores)  // 校验所有条目

    // 批量写入（不要逐条 INSERT）
    scoreRepo.batchUpdate(scores)

    return BatchResult(success: scores.length, failed: 0)
```

#### 大批量异步（> 100 条）

```
func ImportStudents(file):
    // 1. 创建任务
    task = importTaskRepo.create(ImportTask(
        status: PENDING,
        fileName: file.name,
        totalRows: countRows(file)
    ))

    // 2. 异步执行
    asyncExecutor.submit(() => processImport(task.id, file))

    // 3. 返回任务 ID
    return ImportTaskResponse(taskId: task.id, status: PENDING)


func processImport(taskId, file):
    task = importTaskRepo.findById(taskId)
    task.status = PROCESSING

    rows = parseFile(file)
    batchSize = 100
    successCount = 0
    errors = []

    for batch in rows.chunked(batchSize):
        try:
            validated = validate(batch)
            studentRepo.batchInsert(validated)
            successCount += validated.length
        catch e:
            errors.add(BatchError(batch, e))

        // 更新进度
        task.progress = successCount / rows.length
        importTaskRepo.update(task)

    task.status = COMPLETED
    task.successCount = successCount
    task.errorDetails = errors
    importTaskRepo.update(task)
```

### 批量操作规范

| 规范 | 说明 |
|------|------|
| **限制单次数量** | 同步接口限制 100 条，超过引导异步 |
| **分批处理** | 大批量分批，每批 100-500 条 |
| **进度反馈** | 异步任务提供进度查询接口 |
| **部分失败处理** | 返回成功/失败明细，不因一条失败全部回滚 |
| **幂等设计** | 支持重试，重复导入不产生重复数据 |
| **超时保护** | 设置合理超时，避免无限阻塞 |

---

## 系统对接实现

### 教育行业常见对接

| 对接方 | 数据 | 方向 | 频率 |
|--------|------|------|------|
| 教育局系统 | 学校/班级/学生基础数据 | 拉取 | 学期初 |
| 学校 OA | 教师信息/组织架构 | 拉取 | 定期同步 |
| 统一身份认证 | 登录/用户信息 | 对接 | 实时 |
| 第三方内容平台 | 课程/教材/题库 | 拉取 | 按需 |
| 家校通系统 | 通知/消息 | 推送 | 实时 |

### 对接实现模式

```
// 外部系统客户端抽象
interface ExternalSystemClient:
    fetchStudents(schoolId, params) -> List<ExternalStudent>
    syncTeachers(schoolId, params) -> SyncResult

// 数据同步 Service
func SyncStudentsFromEducationBureau(schoolId):
    // 1. 拉取外部数据
    externalStudents = educationClient.fetchStudents(schoolId)

    // 2. 数据映射（外部格式 → 内部格式）
    internalStudents = externalStudents.map(mapToInternalStudent)

    // 3. 差异比对
    existing = studentRepo.findBySchoolId(schoolId)
    diff = calculateDiff(existing, internalStudents)

    // 4. 增量更新
    studentRepo.batchInsert(diff.newStudents)
    studentRepo.batchUpdate(diff.updatedStudents)
    // 注意：不自动删除，标记为"待确认"

    // 5. 记录同步日志
    syncLogRepo.save(SyncLog(
        source: "EDUCATION_BUREAU",
        type: "STUDENT",
        added: diff.newStudents.length,
        updated: diff.updatedStudents.length,
        timestamp: now()
    ))
```

### 对接规范

| 规范 | 说明 |
|------|------|
| **适配层隔离** | 外部系统客户端独立封装，不侵入业务层 |
| **数据映射** | 外部数据格式在适配层转换为内部格式 |
| **差异同步** | 增量更新，不全量覆盖 |
| **异常容错** | 外部系统不可用时有降级方案 |
| **同步日志** | 每次同步记录日志（数量、耗时、错误） |
| **幂等** | 重复同步不产生重复数据 |
