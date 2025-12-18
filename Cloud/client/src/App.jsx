import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import useAuthPresenter from './mvp/presenters/useAuthPresenter'
import FeedView from './mvp/views/FeedView'
import LoginView from './mvp/views/LoginView'
import RegisterView from './mvp/views/RegisterView'
import ProfileView from './mvp/views/ProfileView'
import SettingsView from './mvp/views/SettingsView'

export default function App() {
  const auth = useAuthPresenter()
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="brand"><Link to="/" className="link">The Dollars</Link></div>
            <nav className="nav">
              <Link to="/">Feed</Link>
              {auth.user ? (
                <>
                  <Link to={`/profile/${auth.user.id}`} className="link">{auth.user.username}'s Profile</Link>
                  <Link to="/settings" className="link">Settings</Link>
                  <button className="button ghost" onClick={auth.logout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={auth.token ? <FeedView token={auth.token} user={auth.user} /> : <Navigate to="/login" />} />
              <Route path="/login" element={<LoginView auth={auth} />} />
              <Route path="/register" element={<RegisterView auth={auth} />} />
              <Route path="/profile/:id" element={auth.token ? <ProfileView token={auth.token} /> : <Navigate to="/login" />} />
              <Route path="/settings" element={auth.token ? <SettingsView token={auth.token} user={auth.user} onDeleted={() => auth.logout()} /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}