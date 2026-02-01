from django.contrib import admin
from django.urls import path
from accounts import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication
    path('api/register/', views.register_user),
    path('api/login/', views.login_user),
    path('api/verify/<str:token>/', views.verify_email),
    
    # Products (Market & Inventory)
    path('api/products/', views.get_products), # Handles GET (all) and POST (create)
    path('api/products/<int:pk>/', views.get_products), # Handles PUT (edit) and DELETE
    
    # Cart & Orders
    path('api/cart/<str:username>/', views.manage_cart),
    path('api/orders/<str:username>/', views.manage_orders),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)