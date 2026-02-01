from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    is_verified = models.BooleanField(default=False)
    auth_token = models.CharField(max_length=100, blank=True)

class Task(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    is_done = models.BooleanField(default=False) # This is for the Complete/Incomplete logic

    def __str__(self):
        return self.title