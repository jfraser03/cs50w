from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.utils.http import urlencode
from django.shortcuts import render, redirect
from django.urls import reverse
from markdown2 import Markdown

from . import util

markdown = Markdown()

def handle_post(f):
    def wrapper (request, *args, **kwargs):
        if request.method == "POST":
            search = request.POST.get('q')
            if search in util.list_entries():
                return HttpResponseRedirect(reverse("entry", args=[search]))
            else:
                return HttpResponseRedirect(reverse("search") + f"?q={search}")
        return f(request, *args, **kwargs)
    return wrapper

@handle_post
def index(request):
    if request.method == "GET":
        return render(request, "encyclopedia/index.html", {
            "entries": util.list_entries()
        })

@handle_post
def info(request, entry):
    if request.method == "GET":
        entry_content = util.get_entry(entry)

        if not entry_content:
            raise Http404("Entry Not Found.")
        else:
            entry_content = markdown.convert(entry_content)

        return render(request, "encyclopedia/entry.html", {
            "entry": entry,
            "entry_content": entry_content
        })
    
@handle_post
def search(request):
    if request.method == "GET":
        search_term = request.GET.get('q')
        
        entries = util.list_entries()
        close_entries = []

        for entry in entries:
            l_entry = entry.lower()
            if search_term.lower() in l_entry.lower():
                close_entries.append(entry)

        return render(request, "encyclopedia/search.html", {
            "entries": close_entries,
            "term": search_term
        })