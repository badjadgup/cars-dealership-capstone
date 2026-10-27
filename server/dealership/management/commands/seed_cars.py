from django.core.management.base import BaseCommand
from dealership.models import CarMake,CarModel
class Command(BaseCommand):
 help='Create the repeatable demonstration car catalogue.'
 def handle(self,*args,**options):
  for make,models in {'Toyota':[('Camry','Sedan'),('RAV4','SUV'),('Corolla','Sedan')],'Honda':[('Civic','Sedan'),('CR-V','SUV'),('Accord','Sedan')],'Ford':[('Mustang','Coupe'),('F-150','Truck'),('Explorer','SUV')],'BMW':[('3 Series','Sedan'),('X5','SUV')],'Hyundai':[('Elantra','Sedan'),('Tucson','SUV')]}.items():
   brand,_=CarMake.objects.get_or_create(name=make)
   for name,body in models: CarModel.objects.get_or_create(make=brand,name=name,defaults={'body_type':body})
  self.stdout.write(self.style.SUCCESS('Car catalogue ready: 5 makes, 13 models.'))
