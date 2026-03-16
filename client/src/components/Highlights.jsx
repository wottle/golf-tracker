import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Award, Calendar, Zap, Trophy } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

function Highlights({ highlights, stats }) {
  const [currentHighlight, setCurrentHighlight] = useState(null);

  useEffect(() => {
    const availableHighlights = buildHighlights();
    if (availableHighlights.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableHighlights.length);
      setCurrentHighlight(availableHighlights[randomIndex]);
    }
  }, [highlights, stats]);

  const buildHighlights = () => {
    const items = [];

    // Ethan's current streak (prioritize Ethan)
    if (highlights.currentStreak && highlights.currentStreak.count >= 2) {
      if (highlights.currentStreak.player === 'ethan') {
        items.push({
          icon: <TrendingUp className="w-8 h-8" />,
          text: `Ethan is on fire with a ${highlights.currentStreak.count} win streak! 🔥`,
          color: 'purple',
          type: 'streak',
          priority: 10
        });
      } else {
        // Only show Dad's streak if it's really long
        if (highlights.currentStreak.count >= 3) {
          items.push({
            icon: <TrendingUp className="w-8 h-8" />,
            text: `Dad is on a ${highlights.currentStreak.count} win streak! 🔥`,
            color: 'orange',
            type: 'streak',
            priority: 3
          });
        }
      }
    }

    // Longest streak ever (prioritize if it's Ethan's)
    if (highlights.longestStreak && highlights.longestStreak.count >= 3) {
      if (highlights.longestStreak.player === 'ethan') {
        items.push({
          icon: <Trophy className="w-8 h-8" />,
          text: `Ethan's record: ${highlights.longestStreak.count} wins in a row! 🏆`,
          color: 'purple',
          type: 'record',
          priority: 9
        });
      } else if (highlights.longestStreak.count >= 4) {
        items.push({
          icon: <Trophy className="w-8 h-8" />,
          text: `Record streak: Dad won ${highlights.longestStreak.count} rounds in a row! 🏆`,
          color: 'orange',
          type: 'record',
          priority: 2
        });
      }
    }

    // First Ethan win - always show this!
    if (stats.firstEthanWin) {
      items.push({
        icon: <Award className="w-8 h-8" />,
        text: `Remember when... ${formatDistanceToNow(new Date(stats.firstEthanWin.date), { addSuffix: true })}, Ethan beat his father for the first time! 🎉`,
        color: 'purple',
        type: 'milestone',
        priority: 8
      });
    }

    // Biggest win (prioritize if Ethan won)
    if (highlights.biggestWin) {
      const date = format(new Date(highlights.biggestWin.round.date), 'MMM d, yyyy');
      if (highlights.biggestWin.winner === 'ethan') {
        items.push({
          icon: <Zap className="w-8 h-8" />,
          text: `Ethan's biggest victory: Won by ${highlights.biggestWin.margin} strokes on ${date}! 💪`,
          color: 'purple',
          type: 'record',
          priority: 9
        });
      } else if (highlights.biggestWin.margin >= 10) {
        items.push({
          icon: <Zap className="w-8 h-8" />,
          text: `Dad's biggest victory: Won by ${highlights.biggestWin.margin} strokes on ${date}! 💪`,
          color: 'orange',
          type: 'record',
          priority: 1
        });
      }
    }

    // Closest match
    if (highlights.closestMatch && highlights.closestMatch.margin <= 3) {
      const date = format(new Date(highlights.closestMatch.round.date), 'MMM d, yyyy');
      items.push({
        icon: <Sparkles className="w-8 h-8" />,
        text: `Nail-biter! The closest match was decided by just ${highlights.closestMatch.margin} stroke${highlights.closestMatch.margin === 1 ? '' : 's'} on ${date}! 😱`,
        color: 'yellow',
        type: 'fun',
        priority: 5
      });
    }

    // On this day (prioritize if Ethan won)
    if (highlights.onThisDay && highlights.onThisDay.length > 0) {
      const round = highlights.onThisDay[0];
      const yearsAgo = new Date().getFullYear() - new Date(round.date).getFullYear();
      if (yearsAgo > 0) {
        const ethanWon = round.ethan_score < round.dad_score;
        const dadWon = round.dad_score < round.ethan_score;
        
        if (ethanWon) {
          items.push({
            icon: <Calendar className="w-8 h-8" />,
            text: `On this day ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago, Ethan won with a score of ${round.ethan_score}! 📅`,
            color: 'purple',
            type: 'anniversary',
            priority: 8
          });
        } else if (dadWon) {
          items.push({
            icon: <Calendar className="w-8 h-8" />,
            text: `On this day ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago, Dad won with a score of ${round.dad_score}! 📅`,
            color: 'blue',
            type: 'anniversary',
            priority: 2
          });
        } else {
          items.push({
            icon: <Calendar className="w-8 h-8" />,
            text: `On this day ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago, they tied at ${round.dad_score}! 📅`,
            color: 'blue',
            type: 'anniversary',
            priority: 4
          });
        }
      }
    }

    // Ethan's best score
    if (stats.bestEthanScore) {
      items.push({
        icon: <Award className="w-8 h-8" />,
        text: `Ethan's personal best: ${stats.bestEthanScore.ethan_score} on ${format(new Date(stats.bestEthanScore.date), 'MMM d, yyyy')}! ⭐`,
        color: 'purple',
        type: 'achievement',
        priority: 7
      });
    }

    // First round ever
    if (highlights.firstRound && stats.totalRounds >= 5) {
      const yearsAgo = new Date().getFullYear() - new Date(highlights.firstRound.date).getFullYear();
      if (yearsAgo > 0) {
        items.push({
          icon: <Calendar className="w-8 h-8" />,
          text: `It all started ${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago on ${format(new Date(highlights.firstRound.date), 'MMM d, yyyy')}! 🌟`,
          color: 'cyan',
          type: 'milestone',
          priority: 6
        });
      }
    }

    // Total rounds milestone
    if (stats.totalRounds === 10 || stats.totalRounds === 25 || stats.totalRounds === 50 || stats.totalRounds === 100) {
      items.push({
        icon: <Trophy className="w-8 h-8" />,
        text: `Milestone achieved: ${stats.totalRounds} rounds played together! 🎊`,
        color: 'green',
        type: 'milestone',
        priority: 7
      });
    }

    // Sort by priority (higher priority first) and return
    return items.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  };

  if (!currentHighlight) {
    return null;
  }

  const colorClasses = {
    orange: 'bg-orange-50 border-orange-300 text-orange-800',
    purple: 'bg-purple-50 border-purple-300 text-purple-800',
    yellow: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    blue: 'bg-blue-50 border-blue-300 text-blue-800',
    cyan: 'bg-cyan-50 border-cyan-300 text-cyan-800',
    green: 'bg-green-50 border-green-300 text-green-800'
  };

  const iconColorClasses = {
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    cyan: 'text-cyan-600',
    green: 'text-green-600'
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 mb-8 border-4 ${colorClasses[currentHighlight.color]}`}>
      <div className="flex items-center gap-4">
        <div className={`${iconColorClasses[currentHighlight.color]} flex-shrink-0`}>
          {currentHighlight.icon}
        </div>
        <p className="text-lg font-semibold leading-relaxed">
          {currentHighlight.text}
        </p>
      </div>
    </div>
  );
}

export default Highlights;
