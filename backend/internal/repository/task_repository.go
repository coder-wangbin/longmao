package repository

import (
	"longmao-backend/internal/database"
	"longmao-backend/internal/model"
)

type TaskRepository interface {
	FindAll() ([]model.Task, error)
	Create(task *model.Task) error
	Update(task *model.Task) error
	Delete(id string) error
	FindByID(id string) (*model.Task, error)
}

type taskRepository struct{}

func NewTaskRepository() TaskRepository {
	return &taskRepository{}
}

func (r *taskRepository) FindAll() ([]model.Task, error) {
	var tasks []model.Task
	// 按位置排序
	result := database.DB.Order("position asc").Find(&tasks)
	return tasks, result.Error
}

func (r *taskRepository) Create(task *model.Task) error {
	return database.DB.Create(task).Error
}

func (r *taskRepository) Update(task *model.Task) error {
	return database.DB.Save(task).Error
}

func (r *taskRepository) Delete(id string) error {
	return database.DB.Where("id = ?", id).Delete(&model.Task{}).Error
}

func (r *taskRepository) FindByID(id string) (*model.Task, error) {
	var task model.Task
	result := database.DB.First(&task, "id = ?", id)
	return &task, result.Error
}
