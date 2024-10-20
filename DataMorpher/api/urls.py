from django.urls import path
from .views import upload_file, get_task_status

urlpatterns = [
    path('upload-file/', upload_file),
    path('task-status/<str:task_id>/', get_task_status),
]