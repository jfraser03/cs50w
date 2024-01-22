from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    def serialize(self):
        # These won't get used but this is how to retreive a list of related users
        list_of_followers = [follows.follower.username for follows in Follow.objects.filter(following=self)]
        list_of_following = [follows.following.username for follows in Follow.objects.filter(follower=self)]
        followers = Follow.objects.filter(following=self).count()
        following = Follow.objects.filter(follower=self).count()

        return {
            "username": self.username,
            "followers": followers,
            "following": following
        }

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.CharField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        likes = Like.objects.filter(post=self).count()
        return {
            "id": self.id,
            "username": self.user.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": likes
        }

class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower_set")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following_set")

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")