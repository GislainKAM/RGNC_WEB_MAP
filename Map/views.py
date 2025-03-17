from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

from Map.models import *
from Map.serializers import *


#reate your views here.


class BornesViewSet(ReadOnlyModelViewSet):
    
    serializer_class = Borneserializer
    def get_queryset(self):
        queryset = Borne.objects.all()
        return queryset
    
    
class CouncilViewSet(ReadOnlyModelViewSet):
    
    serializer_class = Councilserializer
    def get_queryset(self):
        queryset = Council.objects.all()
        return queryset
    
    