import { useState, useEffect } from 'react';
import localforage from 'localforage';
import './Home.css';

const API_URL = 'http://localhost:3001';

function Home() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);
  const [notification, setNotification] = useState('');


  useEffect(() => {
    loadTodos();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    requestNotificationPermission();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadTodos = async () => {
    try {
      const localTodos = await localforage.getItem('todos');
      if (localTodos && localTodos.length > 0) {
        setTodos(localTodos);
      }

      if (navigator.onLine) {
        try {
          const response = await fetch(`${API_URL}/todos`);
          const data = await response.json();
          setTodos(data);
          await localforage.setItem('todos', data);
        } catch (error) {
          console.log('Backend no disponible, usando datos locales');
        }
      }
    } catch (error) {
      console.error('Error cargando tareas:', error);
      const localTodos = await localforage.getItem('todos');
      if (localTodos) {
        setTodos(localTodos);
      }
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setInput('');

    await localforage.setItem('todos', updatedTodos);

    if (navigator.onLine) {
      try {
        console.log('📤 Enviando al backend:', newTodo);
        const response = await fetch(`${API_URL}/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTodo)
        });
        console.log('Respuesta del POST:', response.status);
        if (response.ok) {
          console.log('✅ Guardado en backend correctamente');
        } else {
          console.error('❌ Error al guardar en backend:', response.status);
        }
      } catch (error) {
        console.error('❌ Backend no disponible:', error);
      }
    }

    showNotification('Nueva tarea agregada', input);
  };

  const toggleTodo = async (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    await localforage.setItem('todos', updatedTodos);

    if (navigator.onLine) {
      try {
        const todo = updatedTodos.find(t => t.id === id);
        console.log('Actualizando en backend, ID:', id, 'Tarea:', todo);
        const response = await fetch(`${API_URL}/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todo)
        });
        console.log('Respuesta del PUT:', response.status);
        if (!response.ok && response.status === 404) {
          console.log('⚠️ Tarea no existe en backend, creándola...');
          await fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(todo)
          });
        }
      } catch (error) {
        console.log('Backend no disponible, actualizado solo local');
      }
    }
  };

  const deleteTodo = async (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    await localforage.setItem('todos', updatedTodos);

    if (navigator.onLine) {
      try {
        console.log('🗑️ Eliminando del backend, ID:', id);
        const response = await fetch(`${API_URL}/todos/${id}`, {
          method: 'DELETE'
        });
        console.log('Respuesta del DELETE:', response.status);
        if (response.ok) {
          console.log('✅ Eliminado del backend correctamente');
        } else if (response.status === 404) {
          console.log('⚠️ La tarea no existía en el backend (solo local)');
        } else {
          console.error('❌ Error al eliminar del backend:', response.status);
        }
      } catch (error) {
        console.error('❌ Backend no disponible:', error);
      }
    }

    showNotification('Tarea eliminada', 'Una tarea ha sido eliminada');
  };

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setNotification(`📍 Ubicación obtenida: ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
          setTimeout(() => setNotification(''), 3000);
        },
        (error) => {
          setNotification('❌ No se pudo obtener la ubicación');
          setTimeout(() => setNotification(''), 3000);
        }
      );
    } else {
      setNotification('❌ Geolocalización no disponible');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const showNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    }
  };

  return (
    <div className="home">
      <header className="header">
        <h1>📝 Mi Lista de Tareas v2.0</h1>
        <div className="status">
          <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 En línea' : '🔴 Sin conexión'}
          </span>
          <button className="location-btn" onClick={getLocation}>
            📍 Ubicación
          </button>
        </div>
      </header>

      {notification && <div className="notification">{notification}</div>}

      {location && (
        <div className="location-info">
          📍 Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
        </div>
      )}

      <div className="add-todo">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Agregar nueva tarea..."
        />
        <button onClick={addTodo}>Agregar</button>
      </div>

      <div className="todos">
        {todos.length === 0 ? (
          <p className="empty-message">No hay tareas. ¡Agrega una nueva!</p>
        ) : (
          todos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button onClick={() => deleteTodo(todo.id)}>🗑️</button>
            </div>
          ))
        )}
      </div>

      <div className="stats">
        <p>Total: {todos.length} | Completadas: {todos.filter(t => t.completed).length}</p>
      </div>
    </div>
  );
}

export default Home;