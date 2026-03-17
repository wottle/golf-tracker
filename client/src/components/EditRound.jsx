import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload, Camera, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

function EditRound() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    date: '',
    course_name: '',
    dad_score: '',
    ethan_score: '',
    dad_front_nine: '',
    ethan_front_nine: '',
    dad_back_nine: '',
    ethan_back_nine: '',
    notes: ''
  });
  const [scorecardFile, setScorecardFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courseNames, setCourseNames] = useState([]);

  useEffect(() => {
    fetchRound();
    fetchCourseNames();
  }, [id]);

  const fetchRound = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rounds/${id}`);
      const data = await response.json();
      setFormData({
        date: data.date,
        course_name: data.course_name || '',
        dad_score: data.dad_score,
        ethan_score: data.ethan_score,
        dad_front_nine: data.dad_front_nine || '',
        ethan_front_nine: data.ethan_front_nine || '',
        dad_back_nine: data.dad_back_nine || '',
        ethan_back_nine: data.ethan_back_nine || '',
        notes: data.notes || ''
      });
    } catch (error) {
      console.error('Error fetching round:', error);
      alert('Failed to load round data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseNames = async () => {
    try {
      const response = await fetch(`${API_URL}/api/courses`);
      const data = await response.json();
      setCourseNames(data);
    } catch (error) {
      console.error('Error fetching course names:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScorecardChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScorecardFile(e.target.files[0]);
    }
  };

  const handlePhotosChange = (e) => {
    if (e.target.files) {
      setPhotoFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch(`${API_URL}/api/rounds/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (scorecardFile) {
        const scorecardFormData = new FormData();
        scorecardFormData.append('scorecard', scorecardFile);
        await fetch(`${API_URL}/api/rounds/${id}/scorecard`, {
          method: 'POST',
          body: scorecardFormData
        });
      }

      for (const photo of photoFiles) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photo);
        await fetch(`${API_URL}/api/rounds/${id}/photos`, {
          method: 'POST',
          body: photoFormData
        });
      }

      navigate(`/round/${id}`);
    } catch (error) {
      console.error('Error updating round:', error);
      alert('Failed to update round. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-golf-green">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate(`/round/${id}`)}
        className="flex items-center gap-2 text-golf-green hover:text-golf-light mb-6 font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Round
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Edit Round</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                list="course-names"
                placeholder="e.g., Pine Valley Golf Club"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none"
              />
              <datalist id="course-names">
                {courseNames.map((name, index) => (
                  <option key={index} value={name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-green-800 mb-4">Final Scores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dad's Score
                </label>
                <input
                  type="number"
                  name="dad_score"
                  value={formData.dad_score}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none text-lg font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ethan's Score
                </label>
                <input
                  type="number"
                  name="ethan_score"
                  value={formData.ethan_score}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none text-lg font-bold"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-4">9-Hole Scores (Optional)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dad's Front 9
                  </label>
                  <input
                    type="number"
                    name="dad_front_nine"
                    value={formData.dad_front_nine}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ethan's Front 9
                  </label>
                  <input
                    type="number"
                    name="ethan_front_nine"
                    value={formData.ethan_front_nine}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dad's Back 9
                  </label>
                  <input
                    type="number"
                    name="dad_back_nine"
                    value={formData.dad_back_nine}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ethan's Back 9
                  </label>
                  <input
                    type="number"
                    name="ethan_back_nine"
                    value={formData.ethan_back_nine}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any memorable moments from the round..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-golf-light focus:outline-none"
            />
          </div>

          <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Upload New Scorecard (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-2">Leave empty to keep existing scorecard</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleScorecardChange}
              className="w-full"
            />
            {scorecardFile && (
              <p className="text-sm text-gray-600 mt-2">Selected: {scorecardFile.name}</p>
            )}
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Add More Photos (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-2">Existing photos will be kept</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
              className="w-full"
            />
            {photoFiles.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {photoFiles.length} new photo(s) selected
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-golf-green hover:bg-golf-light text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Update Round'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/round/${id}`)}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRound;
