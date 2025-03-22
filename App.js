//app.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [document, setDocument] = useState("");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Establish WebSocket connection
        const newSocket = new WebSocket('ws://localhost:5000');
        
        newSocket.onopen = () => {
            console.log('WebSocket connection established');
        };

        newSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'init' || message.type === 'update') {
                    setDocument(message.data);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        newSocket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Store WebSocket instance in state
        setSocket(newSocket);

        // Cleanup WebSocket connection on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    const handleChange = (e) => {
        const newDocument = e.target.value;
        setDocument(newDocument);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'update', data: newDocument }));
        }
    };

    // Function to save document
    const handleSave = async () => {
      try {
          const response = await fetch('http://localhost:5000/save', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content: document }),
          });

          const result = await response.json();
          if (result.success) {
              alert('Document saved successfully!');
          } else {
              alert('Failed to save document.');
          }
      } catch (error) {
          console.error('Error saving document:', error);
          alert('An error occurred while saving.');
      }
  };

  return (
    <div className="App" >
        <h1>Welcome to GoDocs !!</h1>
        <h4>A collaborative document editor</h4>
        <textarea 
            value={document}
            onChange={handleChange}
            rows="20"
            cols="80"
        />
        <br />
        <button onClick={handleSave}>Save</button>
    </div>
);
}

export default App;
