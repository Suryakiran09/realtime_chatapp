from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import APIView
from rest_framework.decorators import action
from .models import User, Room, Message
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .serializers import RegisterSerializer, RoomSerializer, MessageSerializer
from django.shortcuts import render

class RegisterView(APIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            is_admin = serializer.validated_data['is_admin']
            
            check = User.objects.filter(username=username).exists()
            
            if check:
                return Response({'message': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            if is_admin:
                user = User.objects.create_superuser(username, password=password, is_admin=True)
            else:
                user = User.objects.create_user(username, password=password)
                
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomObtainAuthToken(APIView):
    serializer_class = RegisterSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            print(username)
            print(password)
            
            user = authenticate(request, username=username, password=password)
            
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                return Response({'token': token.key, 'is_admin': user.is_admin, 'user_id': user.id}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoomViewSet(viewsets.ModelViewSet):
   queryset = Room.objects.all()
   serializer_class = RoomSerializer

   def get_permissions(self):
       if self.action == 'join':
           return [IsAuthenticated()]
       if self.action == 'list':
           return [IsAuthenticated()]
       if self.action == 'retrieve':
           return [IsAuthenticated()]
       else:
           return [IsAuthenticated(), IsAdminUser()]

   def perform_create(self, serializer):
       serializer.save(created_by=self.request.user)

   @action(detail=True, methods=['post'])
   def join(self, request, pk=None):
       room = self.get_object()
       user = request.user
       room.users.add(user)
       return Response({'detail': f'You have joined the room "{room.name}"'}, status=status.HTTP_200_OK)

class ListMessagesView(APIView):
    def get(self, request, room_id):
        room = Room.objects.get(id=room_id)
        messages = room.messages.all()
        serializer = MessageSerializer(messages, many=True)
        response = {
            'name': room.name,
            'messages': serializer.data
        }
        return Response(response)

class CreateMessageView(APIView):
    def post(self, request, room_id):
        serializer = MessageSerializer(data=request.data)
        room = Room.objects.get(id=room_id)
        if serializer.is_valid():
            message = Message.objects.create(room=room, user=request.user, content = serializer.validated_data['content'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



def chat_view(request, room_name=None):
    return render(request, 'room.html', {"room_name": room_name})