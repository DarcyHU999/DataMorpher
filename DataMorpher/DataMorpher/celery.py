# DataMorpher/celery.py

from __future__ import absolute_import
import os
from celery import Celery
from django.conf import settings  # 新增

# set Django default setting module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DataMorpher.settings')

app = Celery('DataMorpher')

# use settings.py settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# automatically find tasks
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
