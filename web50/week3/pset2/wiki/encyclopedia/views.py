from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.utils.http import urlencode
from django.shortcuts import render, redirect
from django.urls import reverse
from markdown2 import Markdown

from . import util
from .helpers import create_entry, handle_post_search, NewEntryForm

markdown = Markdown()

@handle_post_search
def index(request):
    if request.method == "GET":
        return render(request, "encyclopedia/index.html", {
            "entries": util.list_entries()
        })

@handle_post_search
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

@handle_post_search
def search(request):
    if request.method == "GET":
        search_term = request.GET.get('q')
        
        entries = util.list_entries()
        close_entries = []

        for entry in entries:
            if search_term.lower() in entry.lower():
                close_entries.append(entry)

        return render(request, "encyclopedia/search.html", {
            "entries": close_entries,
            "term": search_term
        })
    
@handle_post_search
def new(request):
    if request.method == "GET":
        return render(request, "encyclopedia/new.html", {
            "form": NewEntryForm()
        })
    
    elif request.method == "POST":
        entry = request.POST.get('new_entry')
        content = request.POST.get('new_content')

        entries = util.list_entries()

        if entry in entries:
            raise Http404("Entry already exists.")

        content = f"# {entry}\n\n{content}"

        create_entry(entry, content)

        return HttpResponseRedirect(reverse("entry", args=[entry]))