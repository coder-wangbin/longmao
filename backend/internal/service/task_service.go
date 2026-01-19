package service

import (
	"longmao-backend/internal/model"
	"longmao-backend/internal/repository"
)

type TaskService interface {
	GetAllTasks() ([]model.Task, error)
	CreateTask(task *model.Task) error
	UpdateTask(id string, updates map[string]interface{}) (*model.Task, error)
	DeleteTask(id string) error
}

type taskService struct {
	repo repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) TaskService {
	return &taskService{repo: repo}
}

func (s *taskService) GetAllTasks() ([]model.Task, error) {
	// 这里可以添加业务逻辑，比如数据清洗等
	return s.repo.FindAll()
}

func (s *taskService) CreateTask(task *model.Task) error {
	// 简单实现：新任务默认放在最后，或者由前端计算 position
	// 这里假设前端如果不传 position，DB 默认为 0，实际生产中可能需要查询 Max position
	return s.repo.Create(task)
}

func (s *taskService) UpdateTask(id string, updates map[string]interface{}) (*model.Task, error) {
	task, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// 简单的字段映射更新
	if title, ok := updates["title"].(string); ok {
		task.Title = title
	}
	if content, ok := updates["content"].(string); ok {
		task.Content = content
	}
	if status, ok := updates["status"].(string); ok {
		task.Status = status
	}
	// 注意：JSON 数字转 map[string]interface{} 通常是 float64
	if pos, ok := updates["position"].(float64); ok {
		task.Position = pos
	}

	err = s.repo.Update(task)
	return task, err
}

func (s *taskService) DeleteTask(id string) error {
	return s.repo.Delete(id)
}
