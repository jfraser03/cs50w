from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
from django.db import IntegrityError
from django.db.models import Count
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .forms import PostForm
from .models import User, Post, Follow, Like


def index(request):
    form = PostForm()

    return render(request, "network/index.html", {'form': form})


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
    
      
def timeline(request, timeline, page_number):
    # Filter posts 'fetch' return based on selected timeline
    if request.user.is_authenticated:
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
    
    # PAGINATION. NEW AND UNTESTED
    paginator = Paginator (posts, 10) #All post objects. Limit to 10 (it breaks it into groups called 'pages')
    # Page object, holding all posts within that page
    page_object = paginator.page(page_number)
    # List of all post objects within the selected page
    objects = page_object.object_list

    return JsonResponse([post.serialize() for post in objects], safe=False)


def profile(request, profile):
    form = PostForm()

    return render(request, "network/index.html", {'form': form})


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

    return JsonResponse(liked, safe=False)


def post(request):

    content = request.META.get('HTTP_CONTENT')
    request_type = request.META.get('HTTP_TYPE')

    # If POST request type (custom defined) is new, make new post
    if request_type == 'new':
        new_post = Post(content=content, user=request.user)
        # Error handling goes here
        new_post.save()

        return JsonResponse("Created", safe=False)

    # If type is update, update existing post with content
    elif request_type == 'update':
        post_id = request.META.get('HTTP_POST_ID')
        post = Post.objects.get(id=post_id)
        post.content = content
        # Error handling goes here
        post.save()

        return JsonResponse("Updated", safe=False)

def profile_info(request, profile):
    user = User.objects.get(username=profile)
    return JsonResponse(user.serialize())

def follow(request, profile):
        
    user = User.objects.get(username=profile)
    followed = Follow.objects.filter(follower=request.user, following=user).exists()

    if request.method == "GET":
        return JsonResponse({'followed': followed})
    
    elif request.method == "POST":
        if followed:
            remove_follow = Follow.objects.get(follower=request.user, following=user).delete()
            followed = False
        else:
            new_follow = Follow(follower=request.user, following=user)
            new_follow.save()
            followed = True
        return JsonResponse({'followed': followed})