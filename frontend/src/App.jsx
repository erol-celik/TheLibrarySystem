import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('Backend bekleniyor...')

  useEffect(() => {
    // Backend'e istek at (GET isteği)
    axios.get('http://localhost:8080/api/v1/test/hello')
      .then(response => {
        // Başarılıysa gelen mesajı kaydet
        setMessage(response.data)
      })
      .catch(error => {
        // Hata varsa konsola yaz
        console.error("Hata oluştu:", error)
        setMessage("Backend'e bağlanılamadı! (CORS Hatası olabilir)")
      })
  }, [])

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>The Library System</h1>
      <h2>Backend Durumu:</h2>
      <p style={{ fontSize: '24px', color: 'green', fontWeight: 'bold' }}>
        {message}
      </p>
    </div>
  )
}

export default App