from django.urls import path, include
from rest_framework import routers

from Map.views import *


router = routers.SimpleRouter()
router.register("borne", BornesViewSet, basename='borne')
router.register("council", CouncilViewSet, basename='council')

urlpatterns = [
    path("api/", include(router.urls))
]
