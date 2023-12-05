from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Meta:
        db_table = 'users'

# ENTITY tables below

class Listing(models.Model):
    title = models.CharField(max_length=40)
    description = models.CharField(max_length=280)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    photo = models.ImageField(upload_to='listing_photos', null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
    
class Category(models.Model):
    title = models.CharField(max_length=40)

    def __str__(self):
        return self.title
    
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    content = models.CharField(max_length=280)

    def __str__(self):
        return f"{self.user.username}'s comment on {self.listing.title}"

# RELATIONAL tables below

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} watching {self.listing.title}"

class ListCat(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def __str__(self):
        return f"Listing: {self.listing.title} | Category: {self.category.title}"
    
class ListUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.listing.title} owned by {self.user.username}"

class Bid(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.user.username} | Bid: {self.listing.title} | Amount: {self.price}"
    
class Winners(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} Won: {self.listing.title}"
