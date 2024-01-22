from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Count
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .forms import PostForm
from .models import User, Post, Follow, Like


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

    elif timeline[0] == '@':
        # If timeline starts with @, then the route is @username
        user = User.objects.get(username=timeline[1:])
        posts = Post.objects.filter(user=user)

    else:
        return JsonResponse({"error": "Invalid timeline."}, status=400)
    
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)

def profile(request, profile):

    user = User.objects.get(username=profile)

    # serialize is a function defined in models.py that returns dict of username, and follow info
    variables = user.serialize()

    return render(request, "network/index.html", variables)

def like(request, user_id, post_id):

    user = User.objects.get(id=user_id)
    post = Post.objects.get(id=post_id)

    if request.method == 'PUT':

        # Toggle like through Like object instance
        try:
            like_post = Like(user=user, post=post)
            like_post.save()
            liked = True
        except IntegrityError:
            Like.objects.get(user=user, post=post).delete()
            liked = False
            
    elif request.method == 'GET':

        liked = Like.objects.filter(user=user, post=post).exists()
        print(f'{post.content} - Liked: {liked}')

    return JsonResponse(liked, safe=False)