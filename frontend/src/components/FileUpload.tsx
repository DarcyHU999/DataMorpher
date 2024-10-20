import React, { useState } from 'react';
import axios from 'axios';

interface InferredTypes {
  [key: string]: string;
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [inferredTypes, setInferredTypes] = useState<InferredTypes | null>(
    null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    axios
      .post('/api/upload-file/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        setInferredTypes(response.data.inferred_types);
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upload data file</h1>
      <input
        type='file'
        accept='.csv, .xlsx, .xls'
        onChange={handleFileChange}
      />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
        Upload and process
      </button>

      {inferredTypes && (
        <div style={{ marginTop: '20px' }}>
          <h2>Inferred data type</h2>
          <table cellPadding='5'>
            <thead>
              <tr>
                <th>List</th>
                <th>data type</th>
                <th>Modification type</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(inferredTypes).map(([column, dtype]) => (
                <tr key={column}>
                  <td>{column}</td>
                  <td>{dtype}</td>
                  <td>
                    <select defaultValue={dtype}>
                      <option value='int'>int</option>
                      <option value='float'>float</option>
                      <option value='string'>string</option>
                      <option value='date'>date</option>
                      <option value='bool'>bool</option>
                      <option value='category'>category</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
