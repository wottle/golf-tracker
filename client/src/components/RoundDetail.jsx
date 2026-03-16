import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Trash2, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

function RoundDetail({ isAuthenticated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRound();
  }, [id]);

  const fetchRound = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rounds/${id}`);
      const data = await response.json();
      setRound(data);
    } catch (error) {
      console.error('Error fetching round:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this round?')) return;

    try {
      await fetch(`${API_URL}/api/rounds/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (error) {
      console.error('Error deleting round:', error);
      alert('Failed to delete round');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Delete this photo?')) return;

    try {
      await fetch(`${API_URL}/api/photos/${photoId}`, { method: 'DELETE' });
      fetchRound();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-golf-green">Loading...</div>
      </div>
    );
  }

  if (!round) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Round not found</p>
      </div>
    );
  }

  const dadWon = round.dad_score < round.ethan_score;
  const ethanWon = round.ethan_score < round.dad_score;
  const tie = round.dad_score === round.ethan_score;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-golf-green hover:text-golf-light mb-6 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {format(new Date(round.date), 'MMMM d, yyyy')}
            </h1>
            {round.course_name && (
              <p className="text-xl text-gray-600">{round.course_name}</p>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className={`rounded-lg p-6 border-4 ${dadWon ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dad</h2>
            <p className={`text-5xl font-bold mb-4 ${dadWon ? 'text-green-600' : 'text-gray-600'}`}>
              {round.dad_score}
            </p>
            {(round.dad_front_nine || round.dad_back_nine) && (
              <div className="space-y-2 text-gray-700">
                {round.dad_front_nine && (
                  <p>Front 9: <span className="font-semibold">{round.dad_front_nine}</span></p>
                )}
                {round.dad_back_nine && (
                  <p>Back 9: <span className="font-semibold">{round.dad_back_nine}</span></p>
                )}
              </div>
            )}
          </div>

          <div className={`rounded-lg p-6 border-4 ${ethanWon ? 'bg-purple-50 border-purple-400' : 'bg-gray-50 border-gray-300'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ethan</h2>
            <p className={`text-5xl font-bold mb-4 ${ethanWon ? 'text-purple-600' : 'text-gray-600'}`}>
              {round.ethan_score}
            </p>
            {(round.ethan_front_nine || round.ethan_back_nine) && (
              <div className="space-y-2 text-gray-700">
                {round.ethan_front_nine && (
                  <p>Front 9: <span className="font-semibold">{round.ethan_front_nine}</span></p>
                )}
                {round.ethan_back_nine && (
                  <p>Back 9: <span className="font-semibold">{round.ethan_back_nine}</span></p>
                )}
              </div>
            )}
          </div>
        </div>

        {tie && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center">
            <p className="text-2xl font-bold text-yellow-800">It's a Tie! 🤝</p>
          </div>
        )}

        {round.notes && (
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">Notes</h3>
            <p className="text-gray-700">{round.notes}</p>
          </div>
        )}
      </div>

      {round.scorecard_image && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Scorecard
          </h2>
          <img
            src={`${API_URL}/${round.scorecard_image}`}
            alt="Scorecard"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {round.photos && round.photos.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" />
            Photos ({round.photos.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {round.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={`${API_URL}/${photo.filename}`}
                  alt={photo.caption || 'Round photo'}
                  className="w-full rounded-lg shadow-md"
                />
                {photo.caption && (
                  <p className="text-sm text-gray-600 mt-2">{photo.caption}</p>
                )}
                {isAuthenticated && (
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoundDetail;
