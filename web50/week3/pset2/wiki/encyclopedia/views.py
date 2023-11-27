from django.shortcuts import render, redirect
from django.http import HttpResponse, Http404
from markdown2 import Markdown

from . import util

markdown = Markdown()


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def css(request):
    entry = markdown.convert(util.get_entry('css'))

    return render(request, "encyclopedia/css_test.html", {
        "entries": entry
    })

def info(request, entry):
    entry_content = util.get_entry(entry)

    if not entry_content:
        raise Http404("Entry Not Found.")
    else:
        entry_content = markdown.convert(entry_content)

    return render(request, "encyclopedia/entry.html", {
        "entry": entry,
        "entry_content": entry_content
    })