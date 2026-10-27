import os
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.getenv('DEBUG', 'true').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY', 'local-development-only-change-before-deploying')
SERVICE_API_KEY = os.getenv('SERVICE_API_KEY', 'local-service-key')
if not DEBUG and (SECRET_KEY.startswith('local-') or SERVICE_API_KEY == 'local-service-key'):
    raise ImproperlyConfigured('Set unique SECRET_KEY and SERVICE_API_KEY in production.')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver').split(',')
CSRF_TRUSTED_ORIGINS = [s for s in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if s]
INSTALLED_APPS = ['django.contrib.admin','django.contrib.auth','django.contrib.contenttypes','django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles','dealership']
MIDDLEWARE = ['django.middleware.security.SecurityMiddleware','whitenoise.middleware.WhiteNoiseMiddleware','django.contrib.sessions.middleware.SessionMiddleware','django.middleware.common.CommonMiddleware','django.middleware.csrf.CsrfViewMiddleware','django.contrib.auth.middleware.AuthenticationMiddleware','django.contrib.messages.middleware.MessageMiddleware','django.middleware.clickjacking.XFrameOptionsMiddleware']
ROOT_URLCONF = 'config.urls'
TEMPLATES = [{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'config.wsgi.application'
DATABASES = {'default':{'ENGINE':'django.db.backends.sqlite3','NAME':os.getenv('SQLITE_PATH',str(BASE_DIR/'db.sqlite3'))}}
AUTH_PASSWORD_VALIDATORS = [{'NAME':'django.contrib.auth.password_validation.'+name} for name in ['UserAttributeSimilarityValidator','MinimumLengthValidator','CommonPasswordValidator','NumericPasswordValidator']]
LANGUAGE_CODE='en-us'
TIME_ZONE='UTC'
USE_I18N=True
USE_TZ=True
STATIC_URL='/static/'
STATIC_ROOT=BASE_DIR/'staticfiles'
STATICFILES_DIRS=[BASE_DIR/'frontend'/'static',BASE_DIR/'frontend'/'dist']
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SECURE=not DEBUG
CSRF_COOKIE_SECURE=not DEBUG
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO','https')
DEALERSHIP_URL=os.getenv('DEALERSHIP_URL','http://127.0.0.1:3030').rstrip('/')
SENTIMENT_URL=os.getenv('SENTIMENT_URL','http://127.0.0.1:5050').rstrip('/')

if os.getenv('DB_ENGINE') == 'postgresql':
 DATABASES={'default':{'ENGINE':'django.db.backends.postgresql','NAME':os.environ['DB_NAME'],'USER':os.environ['DB_USER'],'PASSWORD':os.environ['DB_PASSWORD'],'HOST':os.environ['DB_HOST'],'PORT':os.getenv('DB_PORT','5432'),'OPTIONS':{'sslmode':os.getenv('DB_SSLMODE','require')},'CONN_MAX_AGE':60}}
