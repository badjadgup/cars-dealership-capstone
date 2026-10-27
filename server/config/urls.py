from django.contrib import admin
from django.urls import path,re_path
from dealership import views as v
urlpatterns=[
 path('admin/',admin.site.urls),path('health/',v.health),
 path('api/csrf/',v.csrf),path('api/me/',v.me),path('api/register/',v.register),
 path('api/login/',v.login_user),path('api/logout/',v.logout_user),
 path('api/dealers/',v.dealers),path('api/dealers/<int:dealer_id>/',v.dealer),
 path('api/dealers/<int:dealer_id>/reviews/',v.reviews),path('api/cars/',v.cars),path('api/analyze/',v.analyze),
 path('djangoapp/login',v.login_user),path('djangoapp/logout',v.logout_user),path('djangoapp/registration',v.register),
 path('djangoapp/get_dealers',v.dealers),path('djangoapp/get_dealers/<str:state>',v.dealers),
 path('djangoapp/dealer/<int:dealer_id>',v.dealer),path('djangoapp/reviews/dealer/<int:dealer_id>',v.reviews),path('djangoapp/get_cars',v.cars),
 re_path(r'^(?!api/|admin/|static/|health/).*$',v.frontend)]
