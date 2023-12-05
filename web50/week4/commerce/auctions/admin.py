from django.contrib import admin
from .models import User, Listing, Category, Comment, Watchlist, ListCat, ListUser, Bid, Winners

# Register your models here.
admin.site.register(User)
admin.site.register(Listing)
admin.site.register(Category)
admin.site.register(ListCat)
admin.site.register(ListUser)
admin.site.register(Watchlist)
admin.site.register(Comment)
admin.site.register(Bid)
admin.site.register(Winners)