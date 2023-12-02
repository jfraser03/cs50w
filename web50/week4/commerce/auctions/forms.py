from django import forms
from .models import Listing, Category

class ListingForm(forms.ModelForm):
    cats = Category.objects.all()
    categories = [(cat.id, cat.title) for cat in cats]
    category = forms.ChoiceField(choices=[("", "Select a category")] + categories, required=True, widget=forms.Select(attrs={'class': 'form-field'}))

    class Meta:
        model = Listing
        
        fields = ["title", "description", "price", "photo", "active"]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-field'}),
            'description': forms.Textarea(attrs={'class': 'form-field'}),
            'price': forms.NumberInput(attrs={'class': 'form-field'}),
            'photo': forms.ClearableFileInput(attrs={'class': 'form-field'}),
            'active': forms.CheckboxInput(attrs={'class': 'form-field'}),
        }
    photo = forms.ImageField(required=False)