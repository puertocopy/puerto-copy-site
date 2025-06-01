import { FaWhatsapp, FaFacebookF, FaInstagram } from "react-icons/fa";

export default function FloatingBubbles() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      {/* WhatsApp */}
      <a
        href="https://wa.me/523223499334"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300"
      >
        <FaWhatsapp size={24} />
      </a>

      {/* Facebook */}
      <a
        href="https://facebook.com/puertocopy"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
      >
        <FaFacebookF size={22} />
      </a>

      {/* Instagram */}
      <a
        href="https://instagram.com/puerto.copy"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:brightness-110 text-white p-3 rounded-full shadow-lg transition-all duration-300"
      >
        <FaInstagram size={22} />
      </a>
    </div>
  );
}
