import { Link } from 'react-router-dom';
import { Trophy, Plus, LogIn, LogOut } from 'lucide-react';

function Header({ isAuthenticated, onLogout }) {
  return (
    <header className="bg-golf-green text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <Trophy className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Dad & Ethan Golf</h1>
              <p className="text-golf-light text-sm">Tracking our rounds together</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/add"
                  className="flex items-center gap-2 bg-golf-light hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add Round
                </Link>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-golf-light hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogIn className="w-5 h-5" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
