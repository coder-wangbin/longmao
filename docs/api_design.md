# 后端 API 设计文档

## 1. 基础规范

### 1.1 基础路径
所有接口统一前缀：`/api/v1`

### 1.2 统一响应格式
所有接口返回 JSON，结构如下：

```json
{
  "code": 0,          // 0 表示成功，非 0 表示错误码
  "data": {},         // 成功时的数据载荷，失败时可为 null
  "message": "ok"     // 提示信息（成功或错误描述）
}
```

### 1.3 核心数据模型 (Task)
`Task` 对象在所有接口中保持一致：

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000", // UUID
  "title": "修复登录 Bug",
  "content": "详情描述...",
  "status": "todo",        // 枚举: todo, doing, done
  "position": 1024.5,      // 浮点数，用于排序
  "created_at": "2026-01-19T10:00:00Z",
  "updated_at": "2026-01-19T12:00:00Z"
}
```

---

## 2. 接口列表

### 2.1 获取任务列表
用于页面初始化，一次性拉取所有数据（看板模式数据量通常不大）。

- **方法**: `GET`
- **路径**: `/tasks`
- **请求参数**: 无
- **响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "...",
      "title": "任务 A",
      "status": "todo",
      "position": 100.0,
      "...": "..."
    },
    {
      "id": "...",
      "title": "任务 B",
      "status": "doing",
      "position": 200.0,
      "...": "..."
    }
  ]
}
```

### 2.2 创建任务
- **方法**: `POST`
- **路径**: `/tasks`
- **请求体 (Request Body)**:
```json
{
  "title": "新任务",             // 必填
  "content": "任务描述",          // 选填
  "status": "todo"               // 选填，默认 todo
  // position 后端自动计算，默认为当前列表最大值 + step
}
```
- **响应示例**:
```json
{
  "code": 0,
  "message": "created",
  "data": { "id": "uuid-new", "title": "新任务", ... } // 返回完整的 Task 对象
}
```

### 2.3 更新任务（含拖拽移动）
该接口通用性强，既用于修改文本，也用于拖拽后的状态/位置更新。

- **方法**: `PUT`
- **路径**: `/tasks/:id`
- **请求体 (Request Body)**: (局部更新，传什么改什么)
```json
{
  "title": "修改后的标题",
  "content": "修改后的内容",
  "status": "doing",      // 拖拽到新列时传
  "position": 150.5       // 拖拽排序时传
}
```
- **响应示例**:
```json
{
  "code": 0,
  "message": "updated",
  "data": { "id": "...", "status": "doing", "position": 150.5, ... }
}
```

### 2.4 删除任务
- **方法**: `DELETE`
- **路径**: `/tasks/:id`
- **请求体**: 无
- **响应示例**:
```json
{
  "code": 0,
  "message": "deleted",
  "data": null
}
```
