import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingDown, Calendar, Award, Target, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Highlights from './Highlights';

const API_URL = import.meta.env.VITE_API_URL || '';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-golf-green">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          <p className="text-xl mb-4">No rounds yet!</p>
          <Link to="/add" className="text-golf-light hover:underline">
            Add your first round
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          title="Total Rounds"
          value={stats.totalRounds}
          color="bg-blue-500"
        />
        <StatCard
          icon={<Trophy className="w-8 h-8" />}
          title="Total Holes"
          value={stats.totalHoles}
          color="bg-cyan-500"
        />
        <StatCard
          icon={<TrendingDown className="w-8 h-8" />}
          title="Ties"
          value={stats.ties}
          color="bg-yellow-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <StatCard
          icon={<Award className="w-8 h-8" />}
          title="Dad Wins"
          value={stats.dadWins}
          color="bg-orange-500"
        />
        <StatCard
          icon={<Award className="w-8 h-8" />}
          title="Ethan Wins"
          value={stats.ethanWins}
          color="bg-purple-500"
        />
        <StatCard
          icon={<Target className="w-8 h-8" />}
          title="Dad Average"
          value={stats.dadAverage}
          color="bg-orange-500"
        />
        <StatCard
          icon={<Target className="w-8 h-8" />}
          title="Ethan Average"
          value={stats.ethanAverage}
          color="bg-purple-500"
        />
        <StatCard
          icon={<Target className="w-8 h-8" />}
          title="Dad Total Strokes"
          value={stats.dadTotalStrokes}
          color="bg-orange-500"
        />
        <StatCard
          icon={<Target className="w-8 h-8" />}
          title="Ethan Total Strokes"
          value={stats.ethanTotalStrokes}
          color="bg-purple-600"
        />
      </div>

      {stats.highlights && (
        <Highlights highlights={stats.highlights} stats={stats} />
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="w-8 h-8 text-golf-green" />
          <h2 className="text-2xl font-bold text-gray-800">Best Scores</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.bestDadScore && (
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <h3 className="font-bold text-green-800 mb-2">Dad's Best Round</h3>
              <p className="text-3xl font-bold text-green-600">{stats.bestDadScore.dad_score}</p>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(stats.bestDadScore.date), 'MMM d, yyyy')}
                {stats.bestDadScore.course_name && ` • ${stats.bestDadScore.course_name}`}
              </p>
            </div>
          )}
          {stats.bestEthanScore && (
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <h3 className="font-bold text-purple-800 mb-2">Ethan's Best Round</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.bestEthanScore.ethan_score}</p>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(stats.bestEthanScore.date), 'MMM d, yyyy')}
                {stats.bestEthanScore.course_name && ` • ${stats.bestEthanScore.course_name}`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-golf-green" />
          <h2 className="text-2xl font-bold text-gray-800">Recent Rounds</h2>
        </div>
        {stats.recentRounds && stats.recentRounds.length > 0 ? (
          <div className="space-y-3">
            {stats.recentRounds.map((round) => (
              <Link
                key={round.id}
                to={`/round/${round.id}`}
                className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition border-2 border-transparent hover:border-golf-light"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {format(new Date(round.date), 'MMMM d, yyyy')}
                    </p>
                    {round.course_name && (
                      <p className="text-sm text-gray-600">{round.course_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      <span className={round.dad_score < round.ethan_score ? 'text-green-600' : 'text-gray-600'}>
                        Dad: {round.dad_score}
                      </span>
                      {' vs '}
                      <span className={round.ethan_score < round.dad_score ? 'text-purple-600' : 'text-gray-600'}>
                        Ethan: {round.ethan_score}
                      </span>
                    </p>
                    {round.dad_score === round.ethan_score && (
                      <p className="text-sm text-yellow-600 font-semibold">Tie!</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No rounds yet. Add your first round!</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition">
      <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default Dashboard;
