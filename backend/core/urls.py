from django.contrib import admin
from django.urls import path
from accounts import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', views.register_user),
    path('api/login/', views.login_user),
    path('api/verify/<str:token>/', views.verify_email),
    path('api/tasks/<str:username>/', views.handle_tasks),
    path('api/tasks/detail/<int:task_id>/', views.task_detail), # Important for PUT/DELETE
]