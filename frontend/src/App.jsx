// src/App.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:7777');

function App() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const isFirstConnection = useRef(true);

    useEffect(() => {
        if (isFirstConnection.current) {
            const userName = prompt('What is your name?');
            setName(userName);
            appendMessage('You joined');
            socket.emit('new-user', userName);
            isFirstConnection.current = false;
        }

        socket.on('chat-message', (data) => {
            appendMessage(`${data.name}: ${data.message}`);
        });

        socket.on('user-connected', (name) => {
            appendMessage(`${name} connected`);
        });

        socket.on('user-disconnected', (name) => {
            appendMessage(`${name} disconnected`);
        });

        // Cleanup on unmount
        return () => {
            socket.off('chat-message');
            socket.off('user-connected');
            socket.off('user-disconnected');
        };
    }, []); // Empty dependency array to run only once

    const appendMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            appendMessage(`You: ${message}`);
            socket.emit('send-chat-message', message);
            setMessage('');
        }
    };

    return (
        <div className="App">
            <div id="title">
                <h1>Corsa</h1>
            </div>
            <div id="message-container">
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <form id="send-container" onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="message-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button type="submit" id="send-button">Send</button>
            </form>
        </div>
    );
}

export default App;
