from django.urls import path
from .views import get_random_number

urlpatterns = [
    path('random-number/', get_random_number),
]
