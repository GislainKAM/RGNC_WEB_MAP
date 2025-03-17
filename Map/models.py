from django.db import models
from django.contrib.gis.db import models as models_gis

# Create your models here.


class Council(models_gis.Model):
    
    name = models_gis.CharField(max_length=30, primary_key=True)
    departement = models_gis.CharField(max_length=30)
    region = models_gis.CharField(max_length=30)
    
    geom = models_gis.MultiPolygonField()
    
    def __str__(self):
        return self.name


class Borne(models_gis.Model):
    
    name = models_gis.CharField(max_length=50, unique=True)
    matricule = models_gis.CharField(unique=True, max_length=10, primary_key=True)
    council = models_gis.ForeignKey(Council, on_delete=models_gis.CASCADE, null=True)
    lat = models_gis.CharField(max_length=25)
    lon = models_gis.CharField(max_length=25)
    place_name = models_gis.CharField(max_length=100, null=True)
    
    geom = models_gis.PointField()
    
    def __str__(self):
        return self.name