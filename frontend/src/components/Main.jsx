import { useState, useEffect } from "react";

export default function Main({activeTab, file, setFile, messages, setMessages, input, setInput, isProcessing, setIsProcessing }) {
  const [documentId, setDocumentId] = useState(null);
  const [uploadedInvoices, setUploadedInvoices] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const API_BASE_URL = "http://localhost:8080/api";

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    const formData = new FormData();
    
    // Backend expects array "files" 
    selectedFiles.forEach(file => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      // console.log("Upload response:", data);

      if (data.success) {
        // Backend returns array of invoices
        setUploadedInvoices(data.invoices);
        
        // Set the first invoice as selected if only one uploaded
        if (data.invoices.length === 1) {
          setSelectedInvoiceId(data.invoices[0].invoice_number);
          setDocumentId(data.invoices[0].invoice_number);
        }
        
        setFile(selectedFiles[0]); 
        
        setMessages([
          {
            role: "assistant",
            text: `I've processed ${data.invoices.length} invoice(s)! ${
              data.invoices.length === 1 
                ? "You can now ask me questions about it." 
                : "Select an invoice from the dropdown to ask specific questions, or ask general questions about all invoices."
            }`,
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            text: data.error || "Sorry, I couldn't process that file. Please try another one.",
          },
        ]);
        setFile(null);
        setUploadedInvoices([]);
      }
    } catch (error) {
      console.log("Upload error:", error);
      setMessages([
        {
          role: "assistant",
          text: "There was an error processing your file. Please try again.",
        },
      ]);
      setFile(null);
      setUploadedInvoices([]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      console.log("Updated documentId:", documentId);
    }
  }, [documentId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");

    try {
      const requestBody = {
        question: currentInput,
      };
      
      // Add invoiceId only if we have a specific invoice selected
      if (selectedInvoiceId && uploadedInvoices.length > 0) {
        requestBody.invoiceId = selectedInvoiceId;
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...newMessages, { role: "assistant", text: data.answer }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            text: data.error || "Sorry, I couldn't process your question. Please try again.",
          },
        ]);
      }
    } catch (error) {
      console.log("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          text: "There was an error processing your question. Please try again.",
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleInvoiceSelection = (invoiceNumber) => {
    setSelectedInvoiceId(invoiceNumber);
    setDocumentId(invoiceNumber);
  };

  return (
    <main className="flex-1 w-full px-4 py-8 md:px-8 lg:px-16">
      {/* Upload Section */}
      {activeTab === "upload" && (
        <section className="flex flex-col items-center justify-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-red-500 mb-6 text-center">
            Upload Your Invoices
          </h2>
          <div className="bg-white/5 backdrop-blur-md border border-zinc-700 rounded-xl p-6 md:p-8 shadow-lg w-full max-w-md text-center transition-all hover:border-red-400/50">
            <div className="border-2 border-dashed border-red-500/30 rounded-lg p-6 mb-4 transition-colors hover:border-red-500/50">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-300">
                  Drag & drop your files here or click to browse
                </p>
                <input
                  type="file"
                  accept=".pdf, image/*"
                  onChange={handleFileChange}
                  multiple
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                />
                <button className="bg-red-500 text-white font-medium px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                  Browse Files
                </button>
              </div>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-zinc-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-200 truncate max-w-xs">
                    {uploadedInvoices.length > 1 
                      ? `${uploadedInvoices.length} invoices uploaded`
                      : file.name
                    }
                  </span>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="mt-4 flex items-center justify-center text-red-500">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing your invoice(s)...
              </div>
            )}
          </div>

          <div className="mt-8 text-center text-gray-400 max-w-lg">
            <p className="mb-2">Supported formats: PDF, JPG, PNG (up to 5 files)</p>
            <p className="text-sm">
              After uploading, switch to the Chat tab to ask questions about your invoices
            </p>
          </div>
        </section>
      )}

      {/* Chat Section */}
      {activeTab === "chat" && (
        <section className="mx-auto w-full max-w-3xl bg-white/5 backdrop-blur-md border border-zinc-700 rounded-xl shadow-lg p-4 md:p-6 transition-all hover:border-red-400/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-red-500">
              Invoice Assistant
            </h2>
            {uploadedInvoices.length > 0 && (
              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                {uploadedInvoices.length} invoice(s) loaded
              </span>
            )}
          </div>

          {/* Invoice Selection Dropdown */}
          {uploadedInvoices.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select specific invoice
              </label>
              <select
                value={selectedInvoiceId || ""}
                onChange={(e) => handleInvoiceSelection(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All invoices</option>
                {uploadedInvoices.map((invoice, index) => (
                  <option key={index} value={invoice.invoice_number}>
                    {invoice.vendor} - #{invoice.invoice_number}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="h-72 md:h-80 overflow-y-auto border border-zinc-700 rounded-lg p-4 bg-zinc-900/50 shadow-inner mb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-3 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p className="text-center">
                  No messages yet. Upload invoices and ask me questions!
                  <br />
                  <span className="text-sm text-gray-600 mt-2 block">
                     General queries...
                  </span>
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-red-500 text-white rounded-br-none"
                        : "bg-zinc-700 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Box */}
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                uploadedInvoices.length === 0 
                  ? "Upload invoices first..." 
                  : selectedInvoiceId 
                    ? "Ask about the selected invoice..." 
                    : "Ask about all invoices..."
              }
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={uploadedInvoices.length === 0}
            />
            <button
              onClick={handleSend}
              disabled={uploadedInvoices.length === 0 || !input.trim() || isProcessing}
              className="bg-red-500 text-white font-semibold px-4 md:px-6 rounded-r-lg hover:bg-red-600 transition-colors disabled:bg-zinc-700 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {uploadedInvoices.length === 0 && (
            <p className="text-sm text-red-400 mt-2">
              Please upload invoices first to start chatting
            </p>
          )}
        </section>
      )} 
    </main>
  );
}