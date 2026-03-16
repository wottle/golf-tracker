import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Trophy, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

function AllRounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rounds`);
      const data = await response.json();
      setRounds(data);
    } catch (error) {
      console.error('Error fetching rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-2xl text-golf-green">Loading rounds...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link
        to="/"
        className="flex items-center gap-2 text-golf-green hover:text-golf-light mb-6 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-golf-green" />
          <h1 className="text-3xl font-bold text-gray-800">All Rounds</h1>
          <span className="text-2xl text-gray-500">({rounds.length})</span>
        </div>

        {rounds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">No rounds yet!</p>
            <Link
              to="/add"
              className="inline-block mt-4 bg-golf-green hover:bg-golf-light text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Add Your First Round
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => {
              const dadWon = round.dad_score < round.ethan_score;
              const ethanWon = round.ethan_score < round.dad_score;
              const tie = round.dad_score === round.ethan_score;

              return (
                <Link
                  key={round.id}
                  to={`/round/${round.id}`}
                  className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition border-2 border-transparent hover:border-golf-light"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-6 h-6 text-golf-green" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {format(new Date(round.date), 'MMMM d, yyyy')}
                        </h3>
                        {round.course_name && (
                          <p className="text-gray-600">{round.course_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-semibold">Dad</p>
                        <p className={`text-3xl font-bold ${dadWon ? 'text-green-600' : 'text-gray-600'}`}>
                          {round.dad_score}
                        </p>
                      </div>

                      <div className="text-2xl font-bold text-gray-400">vs</div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 font-semibold">Ethan</p>
                        <p className={`text-3xl font-bold ${ethanWon ? 'text-purple-600' : 'text-gray-600'}`}>
                          {round.ethan_score}
                        </p>
                      </div>

                      {!tie && (
                        <div className="ml-4">
                          <Trophy className={`w-8 h-8 ${dadWon ? 'text-green-600' : 'text-purple-600'}`} />
                        </div>
                      )}
                    </div>
                  </div>

                  {round.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 italic">{round.notes}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllRounds;
