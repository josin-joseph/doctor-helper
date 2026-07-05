from django.contrib import admin
from .models import VitalSigns, Encounter, Prescription, Allergy

admin.site.register(VitalSigns)
admin.site.register(Encounter)
admin.site.register(Prescription)
admin.site.register(Allergy)