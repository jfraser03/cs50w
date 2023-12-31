from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .forms import ListingForm
from .models import User, Listing, Category, ListCat, ListUser, Watchlist, Bid, Comment, Winners


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

            bids = Bid.objects.filter(listing=listing_object).count()
            comments = Comment.objects.filter(listing=listing_object)
            try:
                owner = ListUser.objects.get(listing=listing_object).user
            except ObjectDoesNotExist:
                owner = None

            inputs = {
                    "listing": listing_object,
                    "watchlist": watchlist,
                    "category": category,
                    "poster": poster,
                    "bids": bids,
                    "comments": comments,
                    "user": request.user,
                    "owner": owner
                }

            if listing_object.active:
                return render(request, "auctions/listing.html", inputs)
            
            else:
                ob = Winners.objects.get(listing=listing_object)
                inputs.update({"winner": ob.user})
                return render(request, "auctions/closed.html", inputs)
            

    if request.method == "GET":
        return load_listing()
        
    elif request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("login"))

        listing_id = request.POST.get("listing_id")
        listing = Listing.objects.get(id=listing_id)
        button = request.POST.get("type")

        # Really trusting the user here - could benefit from client and server side validation
        if button == "watchlist_remove":
            watchlist = Watchlist.objects.filter(user=request.user, listing=listing).delete()
        elif button == "watchlist_add":
            watchlist = Watchlist(user=request.user, listing=listing)
            watchlist.save()
        elif button == "bid":
            bid = float(request.POST.get("bid"))
            new_bid = Bid(user=request.user, listing=listing, price=bid)
            if bid > listing.price:
                listing.price = bid
                new_bid.save()
                listing.save()
        elif button == "comment":
            comment = request.POST.get("comment")
            new_comment = Comment(user=request.user, listing=listing, content=comment)
            new_comment.save()
        elif button == "close_listing":
            listing.active = False
            highest_bidder = Bid.objects.filter(listing=listing).order_by("-price").first().user
            new_winner = Winners(user=highest_bidder, listing=listing)
            listing.save()
            new_winner.save()

        return load_listing()

def watchlist(request):
    if request.method == "GET":
        watchlist = Watchlist.objects.filter(user=request.user)

        listings = [ob.listing for ob in watchlist]

        return render(request, "auctions/watchlist.html", {
            "active_listings": listings,
            "user": request.user
        })

def categories(request, category=None):
    if category == None:
        cats = Category.objects.all()

        return render(request, "auctions/categories.html", {
            "categories": cats
        })
    else:
        cat = Category.objects.get(title=category)
        listcat = ListCat.objects.filter(category=cat)
        listings = [ob.listing for ob in listcat if ob.listing.active]
        return render(request, "auctions/category.html", {
            "category": category,
            "active_listings": listings
        })
