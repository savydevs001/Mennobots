const Popup = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg max-h-[100vh] overflow-auto max-w-lg w-full">
        {children}
      </div>
    </div>
  );
};

export default Popup;
