from django.contrib import admin
from .models import CarMake,CarModel
admin.site.register(CarMake)
admin.site.register(CarModel)
admin.site.site_header='Cars Dealership administration'
