from django.contrib import admin
from django.urls import path
from accounts import views

urlpatterns = [
    path('admin/', admin.site.urls),
    # Authentication
    path('api/register/', views.register_user),
    path('api/verify/<str:token>/', views.verify_email),
    path('api/login/', views.login_user),
    # Shop Logic
    path('api/products/', views.get_products),
    path('api/cart/<str:username>/', views.manage_cart),
    path('api/orders/<str:username>/', views.manage_orders),
]