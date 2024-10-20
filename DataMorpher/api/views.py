from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import random
# Create your views here.

@api_view(['GET'])
def get_random_number(request):
    number = random.randint(1, 100)
    return Response({'random_number': number})