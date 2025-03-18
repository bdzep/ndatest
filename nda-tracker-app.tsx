import React, { useState, useEffect } from 'react';
import _ from 'lodash';

// Main application component
const NDATracker = () => {
  // State for storing all contracts
  const [contracts, setContracts] = useState([]);
  // State for currently selected contract
  const [selectedContract, setSelectedContract] = useState(null);
  // State for drop zone active status
  const [isDragActive, setIsDragActive] = useState(false);
  // State for showing the processing indicator
  const [isProcessing, setIsProcessing] = useState(false);
  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    effectiveDate: '',
    expiryDate: '',
    counterparty: '',
    limitations: '',
    obligations: '',
    confidentialityPeriod: '',
    notes: ''
  });

  // Load contracts from local storage on component mount
  useEffect(() => {
    const savedContracts = localStorage.getItem('ndaContracts');
    if (savedContracts) {
      setContracts(JSON.parse(savedContracts));
    }
  }, []);

  // Save contracts to local storage when they change
  useEffect(() => {
    localStorage.setItem('ndaContracts', JSON.stringify(contracts));
  }, [contracts]);

  // Handle file drop
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragActive(false);
    setIsProcessing(true);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Simulate OCR and data extraction process
      setTimeout(() => {
        // This would be replaced with actual OCR processing
        const extractedData = simulateOCRExtraction(file.name);
        setFormData(extractedData);
        setIsProcessing(false);
      }, 2000);
    }
  };

  // Simulate OCR extraction (in a real app, this would use a proper OCR library)
  const simulateOCRExtraction = (filename) => {
    // Generate some realistic-looking extracted data based on the filename
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    
    return {
      title: filename.replace('.pdf', ''),
      effectiveDate: today.toISOString().split('T')[0],
      expiryDate: futureDate.toISOString().split('T')[0],
      counterparty: `${filename.split('-')[0]} Inc.`,
      limitations: 'No disclosure to third parties without written consent',
      obligations: 'Return or destroy confidential information upon termination',
      confidentialityPeriod: '3 years after termination',
      notes: ''
    };
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save contract to state
  const handleSaveContract = () => {
    if (formData.title) {
      const newContract = {
        id: Date.now().toString(),
        ...formData,
        dateAdded: new Date().toISOString()
      };
      
      setContracts([...contracts, newContract]);
      setFormData({
        title: '',
        effectiveDate: '',
        expiryDate: '',
        counterparty: '',
        limitations: '',
        obligations: '',
        confidentialityPeriod: '',
        notes: ''
      });
    }
  };

  // Select a contract for viewing
  const handleSelectContract = (contract) => {
    setSelectedContract(contract);
    setFormData(contract);
  };

  // Delete a contract
  const handleDeleteContract = (id, e) => {
    e.stopPropagation(); // Prevent selecting the contract when clicking delete
    const updatedContracts = contracts.filter(contract => contract.id !== id);
    setContracts(updatedContracts);
    
    if (selectedContract && selectedContract.id === id) {
      setSelectedContract(null);
      setFormData({
        title: '',
        effectiveDate: '',
        expiryDate: '',
        counterparty: '',
        limitations: '',
        obligations: '',
        confidentialityPeriod: '',
        notes: ''
      });
    }
  };

  // Update an existing contract
  const handleUpdateContract = () => {
    if (selectedContract && formData.title) {
      const updatedContracts = contracts.map(contract => 
        contract.id === selectedContract.id ? {...formData, id: contract.id, dateAdded: contract.dateAdded} : contract
      );
      setContracts(updatedContracts);
      setSelectedContract(null);
      setFormData({
        title: '',
        effectiveDate: '',
        expiryDate: '',
        counterparty: '',
        limitations: '',
        obligations: '',
        confidentialityPeriod: '',
        notes: ''
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setSelectedContract(null);
    setFormData({
      title: '',
      effectiveDate: '',
      expiryDate: '',
      counterparty: '',
      limitations: '',
      obligations: '',
      confidentialityPeriod: '',
      notes: ''
    });
  };

  // Filter contracts with approaching expiry dates (within 30 days)
  const upcomingExpirations = contracts.filter(contract => {
    if (!contract.expiryDate) return false;
    const expiryDate = new Date(contract.expiryDate);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <h1 className="text-2xl font-semibold">NDA & Contract Tracker</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Contract List */}
        <div className="w-64 bg-white shadow-md overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Your Contracts</h2>
          </div>
          
          {contracts.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">
              No contracts yet. Drop a PDF to add one.
            </div>
          ) : (
            <ul className="divide-y">
              {contracts.map(contract => (
                <li 
                  key={contract.id} 
                  className={`p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center ${selectedContract && selectedContract.id === contract.id ? 'bg-blue-50' : ''}`}
                  onClick={() => handleSelectContract(contract)}
                >
                  <div>
                    <p className="font-medium truncate">{contract.title}</p>
                    <p className="text-sm text-gray-500">
                      {contract.counterparty} - Expires: {contract.expiryDate || 'N/A'}
                    </p>
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={(e) => handleDeleteContract(contract.id, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Drop Zone and Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Drop Zone */}
            <div 
              className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              {isProcessing ? (
                <div>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing document...</p>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    Drag and drop your NDA or contract PDF here
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    The system will automatically extract relevant data
                  </p>
                </>
              )}
            </div>

            {/* Contract Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedContract ? 'Edit Contract Details' : 'New Contract Details'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Counterparty</label>
                  <input
                    type="text"
                    name="counterparty"
                    value={formData.counterparty}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={formData.effectiveDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confidentiality Period</label>
                  <input
                    type="text"
                    name="confidentialityPeriod"
                    value={formData.confidentialityPeriod}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Limitations</label>
                <textarea
                  name="limitations"
                  value={formData.limitations}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Obligations</label>
                <textarea
                  name="obligations"
                  value={formData.obligations}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                {selectedContract ? (
                  <>
                    <button 
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateContract}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Update Contract
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleSaveContract}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    disabled={!formData.title}
                  >
                    Save Contract
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Alerts & Reminders */}
        <div className="w-64 bg-white shadow-md overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Alerts & Reminders</h2>
          </div>

          <div className="p-4">
            <h3 className="font-medium text-sm text-red-600 mb-2">Expiring Soon</h3>
            {upcomingExpirations.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming expirations</p>
            ) : (
              <ul className="divide-y">
                {upcomingExpirations.map(contract => (
                  <li key={contract.id} className="py-2">
                    <p className="text-sm font-medium">{contract.title}</p>
                    <p className="text-xs text-gray-500">Expires: {contract.expiryDate}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4 border-t">
            <h3 className="font-medium text-sm text-blue-600 mb-2">Statistics</h3>
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Total Contracts</p>
                <p className="text-lg font-semibold">{contracts.length}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs text-gray-500">Expiring in 30 Days</p>
                <p className="text-lg font-semibold">{upcomingExpirations.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NDATracker;
