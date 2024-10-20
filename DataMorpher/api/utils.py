import pandas as pd
import numpy as np

def infer_data_types(file_path):
    try:
        na_values = ['Not Available', 'N/A', 'NA', 'NaN', '']
        df = pd.read_csv(file_path, encoding='utf-8', engine='python', na_values=na_values)
        
        # type map
        type_mapping = {
            'Int64': 'Int',            
            'Float64': 'Float',
            'string': 'String',
            'datetime64[ns]': 'Date',
            'bool': 'Bool',
            'category': 'Category',
            'timedelta64[ns]': 'TimeDelta',
        }

        inferred_types = {}
        for column in df.columns:
            col_data = df[column]
            num_total = len(col_data)
            num_unique = col_data.nunique(dropna=True)
            
            inferred_type = 'String'  # default as string

            num_non_null = col_data.notna().sum()
            
            numeric_col = pd.to_numeric(col_data, errors='coerce')
            num_numeric = numeric_col.notna().sum()

            if num_numeric / num_non_null >= 0.6:  # threshold as 60%
                # int or float
                if np.all(numeric_col.dropna() == numeric_col.dropna().astype(int)):
                    inferred_type = 'Int'
                    df[column] = numeric_col.astype('Int64')  
                else:
                    inferred_type = 'Float'
                    df[column] = numeric_col.astype('Float64')
            else:
                # try to transfer to date
                datetime_col = pd.to_datetime(col_data, errors='coerce', infer_datetime_format=True)
                num_datetime = datetime_col.notna().sum()

                if num_datetime / num_non_null >= 0.6:
                    inferred_type = 'Date'
                    df[column] = datetime_col
                else:
                    if num_unique / num_non_null <= 0.5:
                        inferred_type = 'Category'
                        df[column] = col_data.astype('category')
                    else:
                        df[column] = col_data.astype('string')

            inferred_types[column] = inferred_type

        return inferred_types, df

    except Exception as e:
        print(f"Error in infer_data_types: {e}")
        raise e
