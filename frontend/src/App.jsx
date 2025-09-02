import { useState } from "react";
import Footer from "./components/Footer";
import Main from "./components/Main";
import Navbar from "./components/Navbar";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-zinc-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Main 
        activeTab={activeTab}
        file={file}
        setFile={setFile}
        messages={messages}
        setMessages={setMessages}
        input={input}
        setInput={setInput}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
      <Footer />
    </div>
  );
}

export default App;
