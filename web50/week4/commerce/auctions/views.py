from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .forms import ListingForm
from .models import User, Listing, Category, ListCat, ListUser, Watchlist


def index(request):
    listings = Listing.objects.filter(active=True)
    return render(request, "auctions/index.html", {
        "active_listings": listings
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
        
    
@login_required(login_url="/login")
def create(request):
    if request.method == "GET":
        return render(request, "auctions/create.html", {
            "form": ListingForm()
        })
    
    elif request.method == "POST":
        form = ListingForm(request.POST)

        if form.is_valid():
            listing_data = {}
            for name, value in form.cleaned_data.items():
                if name != "category":
                    listing_data[name] = value

            new_listing = Listing.objects.create(**listing_data)
            category_id = form.cleaned_data["category"]
            category_object = Category.objects.get(id=category_id)

            ListCat.objects.create(listing=new_listing, category=category_object)
            ListUser.objects.create(listing=new_listing, user=request.user)

        return HttpResponseRedirect(reverse("index"))

def listing(request):
    def load_listing():
            listing_id = request.GET.get("id")
            listing_object = Listing.objects.get(id=listing_id)
            
            try:
                if Watchlist.objects.filter(user=request.user, listing=listing_object):
                    watchlist = True
                else:
                    watchlist = False
            except TypeError:
                watchlist = False

            category = ListCat.objects.get(listing=listing_object).category

            try:
                poster = ListUser.objects.get(listing=listing_object)
                poster = poster.user
            except ListUser.DoesNotExist:
                poster = None

            
            return render(request, "auctions/listing.html", {
                "listing": listing_object,
                "watchlist": watchlist,
                "category": category,
                "poster": poster
            })

    if request.method == "GET":
        return load_listing()
        
    elif request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("login"))

        listing_id = request.POST.get("listing_id")
        listing = Listing.objects.get(id=listing_id)
        button = request.POST.get("type")

        if button == "watchlist_remove":
            watchlist = Watchlist.objects.filter(user=request.user, listing=listing).delete()
        elif button == "watchlist_add":
            watchlist = Watchlist(user=request.user, listing=listing)
            watchlist.save()
        elif button == "bid":
            pass

        return load_listing()






