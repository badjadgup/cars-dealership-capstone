"""Course REST contract, kept separate from the React application's API."""
import json
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from .models import CarModel
from .views import json_body, service

@require_POST
@json_body
def login_course(request, data):
    username, password = data.get('userName'), data.get('password')
    if not isinstance(username, str) or not isinstance(password, str):
        return JsonResponse({'error': 'userName and password are required.'}, status=400)
    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'userName': username, 'status': 'Not Authenticated'}, status=401)
    login(request, user)
    return JsonResponse({'userName': user.username, 'status': 'Authenticated'})

@require_http_methods(['GET', 'POST'])
def logout_course(request):
    # The assessment explicitly requests GET. Keep that legacy behavior in the
    # development/lab mode; the production React API continues to require POST.
    if request.method == 'GET' and not settings.DEBUG:
        return JsonResponse({'error': 'Use POST to log out in production.'}, status=405)
    logout(request)
    return JsonResponse({'userName': ''})

@require_GET
def cars_course(request):
    models = CarModel.objects.select_related('make').order_by('make__name', 'name')
    return JsonResponse({'CarModels': [{'CarModel': model.name, 'CarMake': model.make.name} for model in models]})

@require_GET
def dealers_course(request, state=None):
    path = '/fetchDealers' + ('/' + state if state else '')
    return service('GET', settings.DEALERSHIP_URL, path)

@require_GET
def dealer_course(request, dealer_id):
    return service('GET', settings.DEALERSHIP_URL, f'/fetchDealer/{dealer_id}')

@require_GET
def reviews_course(request, dealer_id):
    return service('GET', settings.DEALERSHIP_URL, f'/fetchReviews/dealer/{dealer_id}')

@require_GET
def analyze_course(request, text):
    response = service('POST', settings.SENTIMENT_URL, '/analyze', json={'text': text})
    if response.status_code != 200:
        return response
    return JsonResponse({'sentiment': json.loads(response.content)['sentiment']})
