import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Logout from './Logout'; // Assuming this is the logout component you have
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPencil } from '@fortawesome/free-solid-svg-icons';
import "./Notes.css"
function Notes() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // Fetch notes when the component mounts
  useEffect(() => {
    const handleFetchNotes = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No token found, redirecting to login');
        navigate('/');
        return;
      }
    
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
         
      });
      console.log(response.data)
     console.log(token)
        setNotes(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          console.error('Unauthorized: Please login again.');
          navigate('/'); // Redirect to login if unauthorized
        } else {
          console.error('Error fetching notes:', error);
        }
      }
    };
    

    handleFetchNotes();  // Call the fetchNotes function on component mount
  }, [navigate]);  // Re-run this effect whenever `navigate` changes (e.g., after login/logout)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentNote({ ...currentNote, [name]: value });
  };

  const handleAddNote = () => {
    const noteWithTimestamp = { ...currentNote, date: new Date().toISOString() };

    if (editingId) {
      // Update existing note
      axios
        .put(`${process.env.REACT_APP_BACKEND_URL}/notes/${editingId}`, noteWithTimestamp, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        })
        .then((response) => {
          setNotes(notes.map((note) => (note._id === editingId ? response.data : note)));
          setCurrentNote({ title: '', content: '' });
          setEditingId(null);
          setShowForm(false);
        })
        .catch((error) => console.error('Error updating note:', error));
    } else {
      // Create new note
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/notes`, noteWithTimestamp, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        })
        .then((response) => {
          setNotes([...notes, response.data]);
          setCurrentNote({ title: '', content: '' });
          setShowForm(false);
        })
        .catch((error) => console.error('Error adding note:', error));
    }
  };

  const handleEditNote = (note) => {
    setCurrentNote({ title: note.title, content: note.content });
    setEditingId(note._id);
    setShowForm(true);
  };

  const handleDeleteNote = (id) => {
    axios
      .delete(`${process.env.REACT_APP_BACKEND_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      })
      .then(() => {
        setNotes(notes.filter((note) => note._id !== id));  // Remove the note from state
      })
      .catch((error) => console.error('Error deleting note:', error));
  };

  const handleCreateNote = () => {
    setCurrentNote({ title: '', content: '' });
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <div className="notes-page">
      <div className="header">
        <h1>Notes APP</h1>
        <div className="login-logout">
          <button className="login-btn">
            <Link to="/">Log in</Link>
          </button>
          <Logout />
        </div>
      </div>

      <div className="notes-content">
        {!showForm && (
          <div>
            {notes.length === 0 ? (
              <p> notes is Empty . Click "+" to add a new note ..</p>
            ) : (
              <div className="notes-container">
                {notes.map((note) => (
                  <div className="note-card" key={note._id}>
                    <h4><span >Note Title: </span >{note.title}</h4>
                    <p><span>Note Content: </span>{note.content}</p>
                    <p className='date'>{new Date(note.date).toLocaleString()}</p>
                    <div className="remove-edit">
                      <button className="edit" onClick={() => handleEditNote(note)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="delete" onClick={() => handleDeleteNote(note._id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="add-note-button" onClick={handleCreateNote}>
              <FontAwesomeIcon icon={faPencil} />
            </button>
          </div>
        )}

        {showForm && (
          <form>
            <input
              className="form-input"
              type="text"
              name="title"
              value={currentNote.title}
              onChange={handleInputChange}
              placeholder="Note Title"
            />
            <textarea
              className="form-textarea"
              name="content"
              value={currentNote.content}
              onChange={handleInputChange}
              placeholder="Note Content"
            />
            <button className="note-btn" type="button" onClick={handleAddNote}>
              {editingId ? 'Update Note' : 'Add Note'}
            </button>
            <button className="note-btn" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Notes;
