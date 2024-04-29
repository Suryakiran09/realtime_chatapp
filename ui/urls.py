from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='ui-login'),
    path('register/', views.register_view, name='ui-register'),
    path('rooms/', views.rooms_view, name='ui-rooms')
]