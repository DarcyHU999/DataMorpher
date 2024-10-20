from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .utils import infer_data_types
import os
from django.conf import settings

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    # Save the file to the media directory
    file_path = os.path.join(settings.MEDIA_ROOT, file_obj.name)
    with open(file_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    # Call the data type inference function
    inferred_types, df = infer_data_types(file_path)

    # Delete temporary files (optional)
    os.remove(file_path)

    return Response({'inferred_types': inferred_types})
