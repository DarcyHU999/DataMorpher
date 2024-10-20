import pandas as pd
import numpy as np
import re

def infer_data_types(file_path):
    try:
        na_values = ['Not Available', 'N/A', 'NA', 'NaN', '']
        df = pd.read_csv(file_path, encoding='utf-8', engine='python', na_values=na_values)
        
        # Data type mapping
        type_mapping = {
            'Int64': 'Int',            
            'Float64': 'Float',
            'complex128': 'Complex',
            'string': 'Text',
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
            
            inferred_type = 'Text'  # Default type is 'Text'

            num_non_null = col_data.notna().sum()
            
            # Try converting to numeric (int or float)
            numeric_col = pd.to_numeric(col_data, errors='coerce')
            num_numeric = numeric_col.notna().sum()

            if num_numeric / num_non_null >= 0.6:
                # Check if integers
                if np.all(numeric_col.dropna() == numeric_col.dropna().astype(int)):
                    inferred_type = 'Int'
                    df[column] = numeric_col.astype('Int64')  
                else:
                    inferred_type = 'Float'
                    df[column] = numeric_col.astype('Float64')
            else:
                # Try converting to complex numbers only if data contains complex patterns
                # Define a regex pattern to detect complex numbers (e.g., '1+2j', '3-4j')
                complex_pattern = re.compile(r'^-?\d+(\.\d+)?[+-]\d+(\.\d+)?j$', re.IGNORECASE)
                
                # Apply the pattern to each value
                is_complex = col_data.dropna().astype(str).apply(lambda x: bool(complex_pattern.match(x)))
                num_complex = is_complex.sum()
                
                if num_complex / num_non_null >= 0.6:
                    # Convert to complex
                    def safe_to_complex(x):
                        try:
                            return complex(x)
                        except:
                            return np.nan
                    complex_col = col_data.apply(safe_to_complex)
                    inferred_type = 'Complex'
                    df[column] = complex_col.astype('complex128')
                else:
                    # Try converting to datetime
                    datetime_col = pd.to_datetime(col_data, errors='coerce', infer_datetime_format=True)
                    num_datetime = datetime_col.notna().sum()

                    if num_datetime / num_non_null >= 0.6:
                        inferred_type = 'Date'
                        df[column] = datetime_col
                    else:
                        # Check if it's a category
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
