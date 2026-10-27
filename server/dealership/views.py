import json
from datetime import date
from functools import wraps
import requests
from django.conf import settings
from django.contrib.auth import authenticate,login,logout,get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError
from django.http import JsonResponse,HttpResponse,FileResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET,require_POST,require_http_methods
from .models import CarMake,CarModel

def json_body(view):
 @wraps(view)
 def wrapped(request,*args,**kwargs):
  try:
   data=json.loads(request.body or '{}')
   if not isinstance(data,dict): raise ValueError()
  except (ValueError,UnicodeDecodeError): return JsonResponse({'error':'A JSON object is required.'},status=400)
  return view(request,data,*args,**kwargs)
 return wrapped

def service(method,base,path,**kwargs):
 try:
  response=requests.request(method,base+path,timeout=8,headers={'X-Service-Key':settings.SERVICE_API_KEY},**kwargs)
  return JsonResponse(response.json(),status=response.status_code,safe=False)
 except (requests.RequestException,ValueError):
  return JsonResponse({'error':'A supporting service is unavailable. Please try again.'},status=503)

@require_GET
def health(request): return JsonResponse({'status':'ok','service':'django'})
@require_GET
@ensure_csrf_cookie
def csrf(request): return JsonResponse({'csrfToken':get_token(request)})
@require_GET
def me(request):
 return JsonResponse({'user':{'username':request.user.username,'first_name':request.user.first_name} if request.user.is_authenticated else None})
@require_POST
@json_body
def register(request,data):
 fields=['username','first_name','last_name','email','password']
 if any(not isinstance(data.get(k),str) or not data[k].strip() for k in fields):
  return JsonResponse({'error':'All five fields are required.'},status=400)
 username=data['username'].strip()
 if len(username)>150 or not all(c.isalnum() or c in '@.+-_' for c in username):
  return JsonResponse({'error':'Use a valid username of at most 150 characters.'},status=400)
 if len(data['email'])>254 or any(len(data[k])>150 for k in ['first_name','last_name']):
  return JsonResponse({'error':'One or more fields are too long.'},status=400)
 user=get_user_model()(username=username,first_name=data['first_name'].strip(),last_name=data['last_name'].strip(),email=data['email'].strip())
 try:
  validate_email(user.email); validate_password(data['password'],user=user)
  user.set_password(data['password']); user.save()
 except ValidationError as exc: return JsonResponse({'error':' '.join(exc.messages)},status=400)
 except IntegrityError: return JsonResponse({'error':'That username is already taken.'},status=409)
 login(request,user)
 return JsonResponse({'user':{'username':user.username}},status=201)
@require_POST
@json_body
def login_user(request,data):
 if not isinstance(data.get('username'),str) or not isinstance(data.get('password'),str):
  return JsonResponse({'error':'Username and password are required.'},status=400)
 user=authenticate(request,username=data['username'],password=data['password'])
 if not user: return JsonResponse({'error':'The username or password is incorrect.'},status=401)
 login(request,user)
 return JsonResponse({'user':{'username':user.username}})
@require_POST
def logout_user(request):
 logout(request)
 return JsonResponse({'message':'Logged out successfully.'})
@require_GET
def dealers(request,state=None):
 return service('GET',settings.DEALERSHIP_URL,'/dealers',params={'state':state or request.GET.get('state','')})
@require_GET
def dealer(request,dealer_id): return service('GET',settings.DEALERSHIP_URL,f'/dealers/{dealer_id}')
@require_http_methods(['GET','POST'])
def reviews(request,dealer_id):
 if request.method=='GET': return service('GET',settings.DEALERSHIP_URL,f'/dealers/{dealer_id}/reviews')
 return post_review(request,dealer_id)
@json_body
def post_review(request,data,dealer_id):
 if not request.user.is_authenticated: return JsonResponse({'error':'Sign in to write a review.'},status=401)
 text,rating,model_id=data.get('review',''),data.get('rating'),data.get('car_model_id')
 if not isinstance(text,str) or not 10<=len(text.strip())<=5000:
  return JsonResponse({'error':'Write a review between 10 and 5,000 characters.'},status=400)
 if type(rating) is not int or rating not in range(1,6): return JsonResponse({'error':'Choose a rating from 1 to 5.'},status=400)
 if type(model_id) is not int: return JsonResponse({'error':'Choose a valid car model.'},status=400)
 try: model=CarModel.objects.select_related('make').get(pk=model_id)
 except CarModel.DoesNotExist: return JsonResponse({'error':'Choose a valid car model.'},status=400)
 year=data.get('car_year')
 if type(year) is not int or not 1980<=year<=date.today().year+1:
  return JsonResponse({'error':'Choose a valid model year.'},status=400)
 purchase=data.get('purchase_date','')
 try:
  if not isinstance(purchase,str) or date.fromisoformat(purchase)>date.today(): raise ValueError()
 except ValueError: return JsonResponse({'error':'Choose a purchase date that is not in the future.'},status=400)
 try:
  result=requests.post(settings.SENTIMENT_URL+'/analyze',json={'text':text},timeout=8,headers={'X-Service-Key':settings.SERVICE_API_KEY})
  result.raise_for_status(); sentiment=result.json()['sentiment']
 except (requests.RequestException,ValueError,KeyError):
  return JsonResponse({'error':'Sentiment analysis is unavailable. Your review has not been saved.'},status=503)
 return service('POST',settings.DEALERSHIP_URL,f'/dealers/{dealer_id}/reviews',json={
  'name':request.user.get_full_name() or request.user.username,'username':request.user.username,
  'review':text.strip(),'rating':rating,'car_make':model.make.name,'car_model':model.name,
  'car_year':year,'purchase_date':purchase,'sentiment':sentiment})
@require_GET
def cars(request):
 return JsonResponse({'car_makes':[{'id':make.id,'name':make.name,'models':list(make.models.order_by('name').values('id','name','body_type'))} for make in CarMake.objects.prefetch_related('models').order_by('name')]})
@require_GET
def analyze(request): return service('POST',settings.SENTIMENT_URL,'/analyze',json={'text':request.GET.get('text','')})
@require_GET
@ensure_csrf_cookie
def frontend(request):
 path=settings.BASE_DIR/'frontend'/'dist'/'index.html'
 if not path.exists(): return HttpResponse('Build the React app first: cd server/frontend && npm ci && npm run build',status=503)
 return FileResponse(path.open('rb'),content_type='text/html')
