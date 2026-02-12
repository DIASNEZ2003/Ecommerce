from django.contrib import admin
from django.urls import path
from accounts import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/register/', views.register_user),
    path('api/login/', views.login_user),
    path('api/verify/<str:token>/', views.verify_email),
    
    path('api/products/', views.get_products),
    path('api/products/<int:pk>/', views.get_products),
    
    path('api/cart/<str:username>/', views.manage_cart),
    path('api/orders/<str:username>/', views.manage_orders),
    
    # Notifications Route
    path('api/notifications/<str:username>/', views.manage_notifications),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)