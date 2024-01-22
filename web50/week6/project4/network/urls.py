
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("@<str:profile>", views.profile, name="profile"),

    # API Routes
    path("posts/<str:timeline>", views.timeline, name="posts"),
    path("likes/<int:user_id>/<int:post_id>", views.like, name="like"),
    path("post", views.post, name="post")
]
