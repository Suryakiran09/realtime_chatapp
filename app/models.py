from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
   is_admin = models.BooleanField(default=False)

class Room(models.Model):
   name = models.CharField(max_length=255)
   topic = models.CharField(max_length=255, null=True, blank=True)
   created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rooms_created')
   users = models.ManyToManyField(User, related_name='rooms_joined', blank=True)
   created_at = models.DateTimeField(auto_now_add=True)
   updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
   room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
   user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
   content = models.TextField()
   created_at = models.DateTimeField(auto_now_add=True)