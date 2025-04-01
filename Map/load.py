import os
from django.contrib.gis.utils import LayerMapping
from Map.models import *

geojson_bornes = os.path.abspath('data/couches/RGNC_BON.shp')
geojson_council = os.path.abspath('data/couches/Cameroun-arrondissement.shp')


Council_mapping = {
    "name": "SUBDIV",
    "departement":"DIVISION",
    "region": "PROVINCE",
    "geom": "MULTIPOLYGON",
}


bornes_mapping = {
    "name": "ATTR_1",
    "matricule": "RGNC_MATRI",
    "council": {'name': 'SUBDIV'},
    "lat": "RGNC_LATIT",
    "lon": "RGNC_LONGI",
    "place_name": "RGNC_LIEUX",
    "reseau":"RGNC_RESEA",
    "geom": "POINT", 
}

def run_borne():
    lm = LayerMapping(Borne, geojson_bornes, bornes_mapping, transform = True) #transform = true : convertit automatiquement les coordonnées dans le bon scr si nécessaire
    lm.save(strict=True, verbose=True) # strict = true vérifie la conformité des données avec le modéle, verbose = true affiche les logs d'importation
    

def run_council():
    lm = LayerMapping(Council, geojson_council, Council_mapping, transform=True)
    lm.save(strict=True, verbose=True)