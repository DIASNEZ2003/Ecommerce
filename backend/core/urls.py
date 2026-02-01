from django.contrib import admin
from django.urls import path
from accounts import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', views.register_user),
    path('api/login/', views.login_user),
    path('api/products/', views.get_products),
    path('api/cart/<str:username>/', views.manage_cart),
    path('api/orders/<str:username>/', views.manage_orders),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # This is the fix