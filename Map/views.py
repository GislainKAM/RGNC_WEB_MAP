from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from django.views.generic import TemplateView
from django_filters.rest_framework import DjangoFilterBackend

from Map.models import *
from Map.serializers import *


#reate your views here.


class BornesViewSet(ReadOnlyModelViewSet):
    
    serializer_class = Borneserializer
    filter_backends = [DjangoFilterBackend]  # 🔹 Active DjangoFilterBackend
    filterset_fields = ['matricule','council', 'name', 'place_name','council__name', 'council__region','council__departement']  # 🔹 Liste des champs filtrables
    queryset = Borne.objects.all()
    
class CouncilViewSet(ReadOnlyModelViewSet):
    
    serializer_class = Councilserializer
    queryset = Council.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["name","departement", "region"]



def HomeView(request):
    template_name = "Map/home.html"
    context = {
        'council_region': Council.objects.values_list('region', flat=True).distinct().order_by('region'),  
        'council_departement': Council.objects.values_list('departement', flat=True).distinct().order_by("departement"),
        'council_name': Council.objects.values_list('name', flat=True).distinct().order_by("name")
    }
    return render(request, template_name, context)

    
    