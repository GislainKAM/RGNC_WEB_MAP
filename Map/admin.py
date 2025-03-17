from django.contrib import admin
from Map.models import *
from leaflet import admin as admin_leaflet

#Register your models here.
@admin.register(Borne)
class bornesadmin(admin_leaflet.LeafletGeoAdmin):
    list_display = ("matricule", "name","place_name", "council", "lat", "lon")
    search_fields = ("matricule", "name","place_name", "council__name")
    
    
@admin.register(Council)
class bornesadmin(admin_leaflet.LeafletGeoAdmin):
    list_display = ("name", "departement", "region")
    search_fields = ("name", "departement", "region")