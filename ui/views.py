# frontend/views.py
from django.shortcuts import render

def login_view(request):
    return render(request, 'login.html')

def register_view(request):
    return render(request, 'register.html')

def rooms_view(request):
    return render(request, 'rooms.html')

