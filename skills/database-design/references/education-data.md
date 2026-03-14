# 教育行业数据建模指南

## 目录

- [教育行业核心实体](#教育行业核心实体)
- [教育数据隐私合规](#教育数据隐私合规)
- [时间维度建模](#时间维度建模)
- [外部系统对接](#外部系统对接)

---

## 教育行业核心实体

### 标准教育实体模型

教育行业有一组高度标准化的核心实体，建模时优先参考：

```
学校(School) ──┬── 年级(Grade) ──── 班级(Class)
               │
               ├── 学科(Subject)
               │
               ├── 教师(Teacher) ──── 授课关系(Teaching)
               │
               └── 学期(Semester)

学生(Student) ──── 学籍(Enrollment) ──── 班级(Class)

课程(Course) ──── 章节(Chapter) ──── 学习记录(LearningRecord)

作业(Assignment) ──── 提交(Submission) ──── 成绩(Score)

考试(Exam) ──── 答题(ExamRecord) ──── 成绩(Score)
```

### 教育实体特殊性

| 实体 | 特殊性 | 建模影响 |
|------|--------|---------|
| **学生** | 未成年人，隐私保护级别最高 | 敏感字段加密，最小化采集 |
| **班级** | 按学期重新编排 | 班级-学生关系需带时间维度 |
| **学期** | 核心时间轴，几乎所有数据都按学期组织 | 学期作为分区键或筛选条件 |
| **成绩** | 一旦确认不可修改，只能追加更正 | 审计+版本模型必备 |
| **学籍** | 跨学校流转，有全国标准 | 预留外部对接字段 |
| **课程** | 版本频繁变更（每学期更新） | 版本化设计 |

### 教育领域聚合建议

| 聚合 | 聚合根 | 包含实体 | 理由 |
|------|--------|---------|------|
| 学校管理 | School | Grade, Class, Semester | 学校是管理边界 |
| 学生管理 | Student | Enrollment, Guardian | 学生是服务对象 |
| 课程管理 | Course | Chapter, Resource | 课程是内容单位 |
| 教学管理 | Teaching | Schedule, Attendance | 以授课为单位 |
| 评估管理 | Exam/Assignment | Submission, Score | 以评估活动为单位 |

---

## 教育数据隐私合规

### 适用法规

| 法规 | 适用范围 | 核心要求 |
|------|---------|---------|
| **个人信息保护法（PIPL）** | 中国 | 最小化采集、明确同意、跨境限制 |
| **未成年人保护法** | 中国 | 不满 14 岁需监护人同意 |
| **儿童个人信息网络保护规定** | 中国 | 单独同意、加密存储、访问控制 |
| **FERPA** | 美国 | 教育记录保护、家长访问权 |
| **COPPA** | 美国 | 13 岁以下儿童信息保护 |
| **GDPR** | 欧盟 | 数据最小化、被遗忘权、DPO |

### 数据分类与保护级别

| 级别 | 数据类型 | 保护措施 |
|------|---------|---------|
| 🔴 **高敏感** | 身份证号、病史、心理评估、家庭经济 | 加密存储 + 脱敏展示 + 访问审计 + 最小授权 |
| 🟡 **中敏感** | 姓名、联系方式、家庭住址、成绩 | 加密存储 + 角色权限控制 |
| 🟢 **低敏感** | 学号、班级、课程、出勤 | 常规访问控制 |

### 字段加密策略

```sql
-- 高敏感字段：应用层加密（AES-256），数据库存密文
CREATE TABLE students (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    student_no      VARCHAR(32)     NOT NULL,           -- 学号（低敏感）
    name_encrypted  BYTEA           NOT NULL,           -- 姓名密文
    id_card_encrypted BYTEA         NULL,               -- 身份证密文
    phone_encrypted BYTEA           NULL,               -- 手机号密文
    -- 脱敏标识字段（用于展示和搜索）
    name_masked     VARCHAR(32)     NOT NULL,           -- 姓名脱敏（如：张**）
    id_card_last4   CHAR(4)         NULL,               -- 身份证后四位
    ...
);
```

### 数据删除合规

| 场景 | 处理方式 |
|------|---------|
| 学生毕业 | 脱敏后归档，保留统计数据 |
| 学生转学 | 学籍数据迁出，本地保留归档 |
| 用户要求删除 | 高敏感数据硬删除，保留匿名化记录 |
| 数据过期 | 按保留策略自动归档/删除 |

---

## 时间维度建模

### 教育时间体系

```
学年(AcademicYear)
├── 上学期(Semester)
│   ├── 月(Month)
│   └── 周(Week)
│       └── 课时(Period)
└── 下学期(Semester)
    ├── 月(Month)
    └── 周(Week)
        └── 课时(Period)
```

### 学期表设计

```sql
CREATE TABLE semesters (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    school_id       BIGINT          NOT NULL,
    academic_year   VARCHAR(16)     NOT NULL,       -- "2025-2026"
    term            VARCHAR(16)     NOT NULL,       -- "first" / "second"
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    is_current      BOOLEAN         NOT NULL        DEFAULT FALSE,
    CONSTRAINT pk_semesters         PRIMARY KEY (id),
    CONSTRAINT fk_sem_school        FOREIGN KEY (school_id) REFERENCES schools(id),
    CONSTRAINT uk_sem_school_year   UNIQUE (school_id, academic_year, term),
    CONSTRAINT ck_sem_dates         CHECK (end_date > start_date)
);

-- 确保每个学校最多一个当前学期
CREATE UNIQUE INDEX uk_sem_current
    ON semesters (school_id) WHERE is_current = TRUE;
```

### 时间维度对建模的影响

| 影响 | 说明 | 处理方式 |
|------|------|---------|
| **数据按学期隔离** | 同一老师不同学期教不同班 | 关系表带 semester_id |
| **学期切换** | 旧学期数据变只读 | 状态标记 + 权限控制 |
| **跨学期统计** | 需要对比不同学期数据 | semester_id 作为分区键 |
| **归档策略** | 老学期数据量大但访问少 | 按学期分区，老学期归档 |

### 分区建议

```sql
-- 按学期分区（PostgreSQL）
CREATE TABLE learning_records (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    student_id      BIGINT          NOT NULL,
    course_id       BIGINT          NOT NULL,
    semester_id     BIGINT          NOT NULL,
    ...
) PARTITION BY LIST (semester_id);

-- 每个学期一个分区
CREATE TABLE learning_records_2025_1 PARTITION OF learning_records
    FOR VALUES IN (1);
CREATE TABLE learning_records_2025_2 PARTITION OF learning_records
    FOR VALUES IN (2);
```

---

## 外部系统对接

### 常见对接系统

| 系统 | 对接内容 | 建模影响 |
|------|---------|---------|
| **教育局学籍系统** | 学生基础信息、学籍变动 | 预留教育部标准字段编码 |
| **学校教务系统** | 课程表、成绩 | ID 映射表 + 数据同步 |
| **第三方登录** | 微信/钉钉/学校统一认证 | 外部 ID 字段 |
| **支付系统** | 课程费用、退款 | 订单与课程关联 |

### 外部 ID 映射表设计

```sql
-- 通用外部 ID 映射表
CREATE TABLE external_id_mappings (
    id              BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    entity_type     VARCHAR(64)     NOT NULL,       -- "student" / "teacher" / "school"
    internal_id     BIGINT          NOT NULL,
    external_system VARCHAR(64)     NOT NULL,       -- "edu_bureau" / "wechat" / "dingtalk"
    external_id     VARCHAR(256)    NOT NULL,
    synced_at       TIMESTAMPTZ     NULL,
    sync_status     VARCHAR(32)     NOT NULL        DEFAULT 'pending',
    CONSTRAINT pk_eidm              PRIMARY KEY (id),
    CONSTRAINT uk_eidm_internal     UNIQUE (entity_type, internal_id, external_system),
    CONSTRAINT uk_eidm_external     UNIQUE (external_system, external_id)
);
```

### 数据同步建模原则

1. **本系统为主** — 外部数据导入后转为本系统实体，不直接用外部结构
2. **映射表解耦** — 内外部 ID 通过映射表关联，不在主表存外部 ID
3. **同步日志** — 每次同步记录日志，便于排查问题
4. **冲突策略** — 定义当内外数据不一致时的处理策略（以谁为准）
5. **兼容旧编码** — 教育局系统可能使用旧国标编码，预留兼容字段
