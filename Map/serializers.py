from rest_framework_gis.serializers import GeoFeatureModelSerializer
from Map.models import *



class Borneserializer(GeoFeatureModelSerializer):
    class Meta:
        fields = ("name", "matricule", "council", "place_name","reseau")
        geo_field = "geom"
        model = Borne


class Councilserializer(GeoFeatureModelSerializer):
    class Meta:
        fields = ("name", "departement", "region")
        geo_field = "geom"
        model = Council
