from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("css/", views.css, name="css"),
    path("<str:entry>/", views.info, name="entry")
]
