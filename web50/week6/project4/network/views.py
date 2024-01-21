from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Count
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .forms import PostForm
from .models import User, Post, Follow


def index(request):
    form = PostForm()

    # Filter posts returned based on timeline selected
    posts = Post.objects.annotate(likes_count=Count('likes'))
    inputs = {
        'form': form,
    }
    return render(request, "network/index.html", inputs)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
      

 
def timeline(request, timeline):
    # Filter posts 'fetch' return based on selected timeline

    following = [follow.following for follow in Follow.objects.filter(follower=request.user)]

    if timeline == 'all':
        posts = Post.objects.all()

    elif timeline == 'following':
        posts = Post.objects.filter(user__in=following)

    else:
        return JsonResponse({"error": "Invalid timeline."}, status=400)
    
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)

def profile(request, profile):
    print("Hello")

    return render(request, "network/profile.html")