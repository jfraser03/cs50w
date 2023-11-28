import os

from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms

from . import util

def create_entry(entry, content):
    with open(f"entries/{entry}.md", 'w') as file:
        file.write(content)

def get_content(entry):
    with open(f"entries/{entry}.md", 'r') as file:
        return file.read()
 
def handle_post_search(f):
    def wrapper (request, *args, **kwargs):
        if request.method == "POST":
            search = request.POST.get('q')
            if not search:
                return f(request, *args, **kwargs)
            elif search in util.list_entries():
                return HttpResponseRedirect(reverse("entry", args=[search]))
            else:
                return HttpResponseRedirect(reverse("search") + f"?q={search}")
        return f(request, *args, **kwargs)
    return wrapper

class EntryForm(forms.Form):
    entry_field = forms.CharField(max_length=20)
    content_field = forms.CharField(widget=forms.Textarea)
