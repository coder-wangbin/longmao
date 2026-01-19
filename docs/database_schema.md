# 数据库设计文档

## 1. 概览

本系统使用 PostgreSQL 作为主数据库。
设计原则遵循：
- **UUID 主键**：便于未来数据迁移和防遍历。
- **严格约束**：利用数据库层面的 Constraint 保证状态合法性。
- **MVCC 时间戳**：记录创建和更新时间。

## 2. Schema SQL

```sql
-- 启用 UUID 生成函数 (PostgreSQL 13+ 内置 gen_random_uuid)
-- 如果是旧版本可能需要: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    title VARCHAR(255) NOT NULL,
    
    content TEXT,
    
    -- 使用 CHECK 约束确保状态值严格符合业务要求
    -- 状态值使用小写，方便前后端统一
    status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'doing', 'done')),
    
    -- 排序字段
    -- 使用双精度浮点数，利用其稠密性实现低成本的插入排序 (Lexorank 的简化版)
    -- 新任务默认放在最后
    position DOUBLE PRECISION NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以优化按列查询的速度
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 创建索引以优化列表排序展示
CREATE INDEX IF NOT EXISTS idx_tasks_status_position ON tasks(status, position);
```

## 3. 字段设计理由

| 字段名 | 类型 | 设计理由 |
| :--- | :--- | :--- |
| **id** | `UUID` | 相比自增 ID，UUID 在分布式环境下更安全，且能避免暴露业务数据量（防 ID 遍历）。前端生成临时 ID 时也更不容易冲突。 |
| **title** | `VARCHAR(255)` | 任务必须有标题。限制 255 字符防止数据库被超长文本撑爆。 |
| **content** | `TEXT` | 任务详情可能较长，使用 TEXT 类型存储。可空。 |
| **status** | `VARCHAR` | **核心字段**。直接使用字符串而不是 ENUM 类型，是因为修改字符串 Check 约束比修改 Enum 类型定义更方便运维。取值严格限制为 `todo`, `doing`, `done`。 |
| **position** | `DOUBLE` | **拖拽排序支持**。使用浮点数排序是经典的“不要过度设计”方案。当在两个任务 A (100) 和 B (200) 之间插入任务 C 时，C 的位置只需设为 150。相比整数链表设计，它在大多数场景下不仅性能好而且实现极其简单。 |
| **created_at** | `TIMESTAMPTZ` | 带时区的时间戳，保证跨时区访问时时间的准确性。 |
| **updated_at** | `TIMESTAMPTZ` | 用于记录最后修改时间，方便前端判断数据新鲜度。 |

## 4. 扩展性说明

- **用户扩展**：后续只需添加 `user_id UUID` 字段并建立外键关联即可。
- **软删除**：如果需要“回收站”功能，可添加 `deleted_at TIMESTAMPTZ` 字段。
