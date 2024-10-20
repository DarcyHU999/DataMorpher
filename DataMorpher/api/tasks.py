from celery import shared_task
from .utils import infer_data_types
import os

@shared_task
def process_file_task(file_path):
    print(f"Processing file at: {file_path}")
    inferred_types, df = infer_data_types(file_path)
    if os.path.exists(file_path):
        os.remove(file_path)
    return inferred_types
