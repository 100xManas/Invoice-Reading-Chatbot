export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="w-full p-4 px-6 md:px-16 shadow bg-zinc-800 text-white flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mr-3">
          <span className="font-bold">DT</span>
        </div>
        <h1 className="text-xl font-bold text-red-500">DocTalk</h1>
      </div>
      <ul className="flex space-x-4 md:space-x-6 text-md font-medium">
        <li 
          className={`hover:text-red-500 duration-150 cursor-pointer py-2 px-1 border-b-2 ${activeTab === "upload" ? "text-red-500 border-red-500" : "border-transparent"}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload
        </li>
        <li 
          className={`hover:text-red-500 duration-150 cursor-pointer py-2 px-1 border-b-2 ${activeTab === "chat" ? "text-red-500 border-red-500" : "border-transparent"}`}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </li>
      </ul>
    </nav>
  );
}