from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework import permissions
from . import views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Realtime chat API",
        default_version='v1',
        description="API for Chat Application",
        terms_of_service="https://www.example.com/policies/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register('rooms', views.RoomViewSet)

urlpatterns = [
   path('', include(router.urls)),
   path('login/', views.CustomObtainAuthToken.as_view(), name='login'),
   path('register/', views.RegisterView.as_view(), name='register'),
   path('ui/room/<int:room_name>/', views.chat_view, name='ui-chat'),
   path('messages/<int:room_id>/', views.ListMessagesView.as_view(), name='list-messages'),
   path('messages/create/<int:room_id>/', views.CreateMessageView.as_view(), name='create-message'),
   path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
