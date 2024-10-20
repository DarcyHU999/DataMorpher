# api/utils.py

import pandas as pd
import numpy as np

def infer_data_types(file_path):
    # read data file
    df = pd.read_csv(file_path, encoding='utf-8', engine='python')

    # define data type
    type_mapping = {
        'int64': 'int',
        'float64': 'float',
        'object': 'string',
        'datetime64[ns]': 'date',
        'bool': 'bool',
        'category': 'category',
        'timedelta[ns]': 'time',
    }

    # infer data type
    inferred_types = {}
    for column in df.columns:
        col_data = df[column]
        # Try converting the column to a numeric type
        if pd.to_numeric(col_data, errors='ignore').notnull().all():
            df[column] = pd.to_numeric(col_data, errors='coerce')
        # Try converting the column to date type
        elif pd.to_datetime(col_data, errors='coerce').notnull().all():
            df[column] = pd.to_datetime(col_data, errors='coerce', infer_datetime_format=True)
        else:
            df[column] = col_data.astype('object')
        # Get the data type of a column
        dtype = df[column].dtype
        inferred_types[column] = type_mapping.get(str(dtype), str(dtype))

    return inferred_types, df
