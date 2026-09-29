from rest_framework import generics, permissions, viewsets
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .models import Profile, SubscriptionPlan
from .serializers import RegisterSerializer, ProfileSerializer, UserSerializer, SubscriptionPlanSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class SubscriptionPlanListView(generics.ListAPIView):
    """GET /auth/plans/ — mavjud obuna rejalari (Billing sahifasi uchun)."""
    queryset = SubscriptionPlan.objects.all().order_by("price_usd")
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]


class AdminUserViewSet(viewsets.ModelViewSet):
    """GET/POST /accounts/admin/users/ — admin uchun foydalanuvchilar ro'yxati va yaratish."""
    queryset = User.objects.select_related("profile").order_by("-date_joined")
    permission_classes = [permissions.IsAdminUser]
    http_method_names = ["get", "post", "head"]

    def get_serializer_class(self):
        return RegisterSerializer if self.request.method == "POST" else UserSerializer

    def create(self, request, *args, **kwargs):
        from rest_framework import status
        data = request.data.copy()
        data.setdefault("password", User.objects.make_random_password())
        serializer = RegisterSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
