# backend/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    is_verified = models.BooleanField(default=False)
    auth_token = models.CharField(max_length=100, blank=True)

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Foods', 'Foods'), ('Items', 'Items'), ('Gadgets', 'Gadgets'),
        ('Furnitures', 'Furnitures'), ('Accessories', 'Accessories'),
        ('Clothes', 'Clothes'), ('Others', 'Others'),
    ]
    seller = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Others') 
    price = models.FloatField(default=0.0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    stock = models.IntegerField(default=10)

class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

class Order(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    total_price = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default="Paid")
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, null=True)

class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}"

