import json
from unittest.mock import patch,Mock
from django.test import TestCase,Client,override_settings
from django.contrib.auth import get_user_model
from .models import CarMake,CarModel
class ApplicationTests(TestCase):
 def setUp(self):
  self.user=get_user_model().objects.create_user('driver',password='Roadtrip!2026')
  make=CarMake.objects.create(name='Toyota')
  self.model=CarModel.objects.create(make=make,name='Camry',body_type='Sedan')
 def post(self,path,data,client=None): return (client or self.client).post(path,json.dumps(data),content_type='application/json')
 def test_car_catalogue(self):
  response=self.client.get('/api/cars/')
  self.assertEqual(response.json()['car_makes'][0]['models'][0]['name'],'Camry')
 def test_registration_login_logout(self):
  payload={'username':'newdriver','first_name':'New','last_name':'Driver','email':'new@example.com','password':'OpenRoad!4279'}
  self.assertEqual(self.post('/api/register/',payload).status_code,201)
  self.assertEqual(self.client.get('/api/me/').json()['user']['username'],'newdriver')
  self.assertEqual(self.post('/api/logout/',{}).status_code,200)
  self.assertIsNone(self.client.get('/api/me/').json()['user'])
  self.assertEqual(self.post('/api/login/',{'username':'newdriver','password':'wrong'}).status_code,401)
  self.assertEqual(self.post('/api/login/',{'username':'newdriver','password':'OpenRoad!4279'}).status_code,200)
  self.assertEqual(self.post('/api/register/',payload).status_code,409)
 def test_csrf_enforced(self):
  client=Client(enforce_csrf_checks=True)
  data={'username':'driver','password':'Roadtrip!2026'}
  self.assertEqual(self.post('/api/login/',data,client).status_code,403)
  token=client.get('/api/csrf/').json()['csrfToken']
  self.assertEqual(client.post('/api/login/',json.dumps(data),content_type='application/json',HTTP_X_CSRFTOKEN=token).status_code,200)
 def test_invalid_inputs_and_auth_required(self):
  self.assertEqual(self.post('/api/register/',{}).status_code,400)
  self.assertEqual(self.client.post('/api/register/','[]',content_type='application/json').status_code,400)
  self.assertEqual(self.post('/api/dealers/1/reviews/',{}).status_code,401)
  self.client.force_login(self.user)
  self.assertEqual(self.post('/api/dealers/1/reviews/',{'review':'short'}).status_code,400)
 @patch('dealership.views.requests.request')
 def test_state_proxy(self,request):
  request.return_value=Mock(status_code=200,json=lambda:{'dealers':[{'state':'Kansas'}]})
  self.assertEqual(self.client.get('/api/dealers/?state=Kansas').status_code,200)
  self.assertEqual(request.call_args.kwargs['params']['state'],'Kansas')
 @patch('dealership.views.requests.request')
 @patch('dealership.views.requests.post')
 def test_review_uses_authenticated_identity_and_sentiment(self,analyze,save):
  self.client.force_login(self.user)
  analyze.return_value=Mock(json=lambda:{'sentiment':'positive'})
  save.return_value=Mock(status_code=201,json=lambda:{'review':{'sentiment':'positive'}})
  payload={'review':'Fantastic services','rating':5,'car_model_id':self.model.id,'car_year':2024,'purchase_date':'2025-01-01','username':'impostor'}
  self.assertEqual(self.post('/api/dealers/1/reviews/',payload).status_code,201)
  self.assertEqual(save.call_args.kwargs['json']['username'],'driver')
  self.assertEqual(save.call_args.kwargs['json']['sentiment'],'positive')
  payload['purchase_date']='2999-01-01'
  self.assertEqual(self.post('/api/dealers/1/reviews/',payload).status_code,400)
 @patch('dealership.views.requests.request')
 def test_unavailable_service(self,request):
  import requests
  request.side_effect=requests.ConnectionError()
  self.assertEqual(self.client.get('/api/dealers/').status_code,503)
