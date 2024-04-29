from rest_framework import serializers
from .models import User, Room, Message

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=200)
    password = serializers.CharField(max_length=200)
    is_admin = serializers.BooleanField(default=False, required=False)

class RoomSerializer(serializers.ModelSerializer):
   class Meta:
       model = Room
       fields = ('id', 'name', 'topic', 'created_by', 'users', 'created_at', 'updated_at')

class MessageSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username')
    class Meta:
        model = Message
        fields = ('id', 'room', 'content', 'user', 'created_at')