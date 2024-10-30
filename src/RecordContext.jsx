// src/RecordContext.js
import React, { createContext, useState } from 'react';

export const RecordContext = createContext();

export const RecordProvider = ({ children }) => {
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  return (
    <RecordContext.Provider value={{ selectedRecordId, setSelectedRecordId }}>
      {children}
    </RecordContext.Provider>
  );
};
