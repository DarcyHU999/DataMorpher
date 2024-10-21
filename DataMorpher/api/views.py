from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .tasks import process_file_task
from celery.result import AsyncResult
from django.conf import settings
import os
import logging

from .utils import infer_data_types
# If using asynchronous task processing, import the task function
# from .tasks import process_file_task

logger = logging.getLogger(__name__)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate file type
    allowed_extensions = ['.csv', '.xls', '.xlsx']
    ext = os.path.splitext(file_obj.name)[1].lower()
    if ext not in allowed_extensions:
        return Response({'error': 'Unsupported file type. Please upload a CSV or Excel file.'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate file size (limit to 100MB)
    max_file_size = 100 * 1024 * 1024  # 50MB
    if file_obj.size > max_file_size:
        return Response({'error': 'File too large. Please upload a file smaller than 50MB.'}, status=status.HTTP_400_BAD_REQUEST)

    
    # ensure MEDIA_ROOT exists
    if not os.path.exists(settings.MEDIA_ROOT):
        os.makedirs(settings.MEDIA_ROOT)

    # save uploading file
    file_path = os.path.join(settings.MEDIA_ROOT, file_obj.name)
    with open(file_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    # get abs path
    absolute_file_path = os.path.abspath(file_path)

    # start Celery task
    task = process_file_task.delay(absolute_file_path)

    return Response({'task_id': task.id})

@api_view(['GET'])
def get_task_status(request, task_id):
    task_result = AsyncResult(task_id)
    if task_result.state == 'SUCCESS':
        result = task_result.get()
        return Response({'status': 'SUCCESS', 'inferred_types': result})
    elif task_result.state == 'FAILURE':
        return Response({'status': 'FAILURE', 'error': str(task_result.result)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({'status': task_result.state})