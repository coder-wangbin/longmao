package model

import (
	"time"
)

type Task struct {
	ID        string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	Content   string    `gorm:"type:text" json:"content"`
	Status    string    `gorm:"type:varchar(20);not null;check:status IN ('todo', 'doing', 'done')" json:"status"`
	Position  float64   `gorm:"type:double precision;not null;default:0" json:"position"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}


// TableName overrides the table name used by User to `profiles`
func (Task) TableName() string {
	return "tasks"
}
