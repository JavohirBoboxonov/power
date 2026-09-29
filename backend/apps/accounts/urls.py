from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileDetailView, AdminUserViewSet, SubscriptionPlanListView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", ProfileDetailView.as_view(), name="auth-me"),
    path("plans/", SubscriptionPlanListView.as_view(), name="auth-plans"),
    path("admin/users/", AdminUserViewSet.as_view({"get": "list", "post": "create"}), name="admin-users"),
]
