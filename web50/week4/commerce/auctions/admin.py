from django.contrib import admin
from .models import User, Listing, Category, Comment, Watchlist, ListCat, Bid

# Register your models here.
admin.site.register(User)
admin.site.register(Listing)
admin.site.register(Category)
admin.site.register(ListCat)