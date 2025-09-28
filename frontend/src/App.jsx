import React, { useEffect, useState } from 'react'
import {
  fetchAnime,
  addAnime,
  updateProgress,
  setProgress,
  setRating,
  fetchStats,
  deleteAnime,
  searchJikan,
  getFeatures
} from './api'

export default function App() {
  const [list, setList] = useState([])
  const [status, setStatus] = useState('all')
  const [title, setTitle] = useState('')
  const [episodes, setEpisodes] = useState(12)
  const [stats, setStats] = useState({})
  const [message, setMessage] = useState('')

  // mode toggle
  const [mode, setMode] = useState('manual')
  const [jikanEnabled, setJikanEnabled] = useState(false)

  // search state
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])

  // inline progress edit
  const [editingId, setEditingId] = useState(null)
  const [progressInput, setProgressInput] = useState('')

  async function refresh() {
    const data = await fetchAnime(status === 'all' ? undefined : status)
    setList(data)
    setStats(await fetchStats())
  }

  useEffect(() => { refresh() }, [status])
  useEffect(() => {
    getFeatures().then(f => {
      setJikanEnabled(!!f.jikanEnabled)
      if (!f.jikanEnabled && mode === 'search') setMode('manual')
    }).catch(() => {})
  }, [])
  
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3500);
    return () => clearTimeout(t);
  }, [message]);

  async function onAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    const exists = list.some(a => a.title.toLowerCase() === title.trim().toLowerCase())
    if (exists) {
      setMessage(`❌ Entry with title "${title}" already exists in your list.`)
      return
    }
    await addAnime({ title: title.trim(), episodes_total: Number(episodes) })
    setTitle('')
    setMessage(`✅ Added "${title}" to your list.`)
    refresh()
  }

  async function doSearch(e) {
    e.preventDefault()
    if (!q.trim()) return
    try {
      const r = await searchJikan(q.trim())
      setResults(r)
    } catch (e) {
      alert(e.message)
    }
  }

  function startEdit(anime) {
    setEditingId(anime.id)
    setProgressInput(String(anime.eps_watched ?? 0))
  }

  async function commitEdit(anime) {
    const v = Math.max(0, Number(progressInput))
    await setProgress(anime.id, v)
    setEditingId(null)
    setProgressInput('')
    refresh()
  }

  // Toggle rating - if clicking the same rating, remove it
  async function handleRatingClick(anime, rating) {
    if (anime.rating === rating) {
      // Remove rating by setting it to null or 0
      await setRating(anime.id, null)
    } else {
      // Set new rating
      await setRating(anime.id, rating)
    }
    refresh()
  }

  // CSS Styles with muted blue color scheme
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      background: 'linear-gradient(135deg, #e6f0ff 0%, #c2d9ff 100%)',
      minHeight: '100vh',
      padding: '20px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#2c3e50'
    },
    title: {
      fontSize: '3rem',
      fontWeight: '700',
      marginBottom: '10px',
      color: '#2c5282',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#4a5568',
      marginBottom: '30px'
    },
    stats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      color: '#2d3748',
      minWidth: '120px',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      display: 'block',
      color: '#2c5282'
    },
    content: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(226, 232, 240, 0.8)'
    },
    modeToggle: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      background: 'rgba(226, 232, 240, 0.5)',
      padding: '8px',
      borderRadius: '12px'
    },
    modeButton: {
      flex: 1,
      padding: '12px 20px',
      border: 'none',
      borderRadius: '8px',
      background: 'transparent',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#4a5568'
    },
    modeButtonActive: {
      background: 'white',
      color: '#2c5282',
      boxShadow: '0 2px 8px rgba(44, 82, 130, 0.15)'
    },
    message: {
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontWeight: '500',
      textAlign: 'center'
    },
    messageSuccess: {
      background: '#f0fff4',
      color: '#22543d',
      border: '1px solid #c6f6d5'
    },
    messageError: {
      background: '#fed7d7',
      color: '#742a2a',
      border: '1px solid #feb2b2'
    },
    form: {
      display: 'flex',
      gap: '12px',
      marginBottom: '25px',
      flexWrap: 'wrap'
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      minWidth: '200px',
      transition: 'all 0.3s ease',
      background: 'white'
    },
    inputFocus: {
      borderColor: '#4299e1',
      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
    },
    select: {
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      background: 'white',
      minWidth: '150px',
      color: '#4a5568'
    },
    button: {
      padding: '12px 24px',
      background: '#4299e1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(66, 153, 225, 0.2)'
    },
    buttonHover: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(66, 153, 225, 0.3)',
      background: '#3182ce'
    },
    searchResults: {
      background: 'rgba(66, 153, 225, 0.05)',
      border: '1px solid #bee3f8',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '25px'
    },
    animeList: {
      listStyle: 'none',
      padding: 0
    },
    animeItem: {
      background: 'white',
      border: '2px solid #f7fafc',
      padding: '20px',
      marginBottom: '15px',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)'
    },
    animeItemHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      borderColor: '#bee3f8'
    },
    ratingButton: {
      width: '32px',
      height: '32px',
      border: '2px solid #e2e8f0',
      borderRadius: '6px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '600',
      fontSize: '14px',
      color: '#4a5568'
    },
    ratingButtonActive: {
      background: '#4299e1',
      color: 'white',
      borderColor: '#4299e1',
      transform: 'scale(1.05)'
    },
    progressInput: {
      width: '60px',
      padding: '6px',
      border: '2px solid #4299e1',
      borderRadius: '6px',
      textAlign: 'center',
      fontSize: '14px'
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>OtakuList</h1>
        <p style={styles.subtitle}>Track your anime journey with ease</p>
        
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{stats.total ?? 0}</span>
            Total Anime
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{stats.hours_watched ?? 0}</span>
            Hours Watched
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{stats.backlog ?? 0}</span>
            Backlog
          </div>
        </div>
      </header>

      <main style={styles.content}>
        {/* Mode Toggle */}
        <div style={styles.modeToggle}>
          <button
            onClick={() => setMode('manual')}
            style={{
              ...styles.modeButton,
              ...(mode === 'manual' && styles.modeButtonActive)
            }}
          >
            📝 Add Manually
          </button>
          {jikanEnabled && (
            <button
              onClick={() => setMode('search')}
              style={{
                ...styles.modeButton,
                ...(mode === 'search' && styles.modeButtonActive)
              }}
            >
              🔍 Search MyAnimeList
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...styles.message,
            ...(message.includes('✅') ? styles.messageSuccess : styles.messageError)
          }}>
            {message}
          </div>
        )}

        {/* Manual Add Form */}
        {mode === 'manual' && (
          <form onSubmit={onAdd} style={styles.form}>
            <input
              placeholder="🎬 Add anime title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              min="0"
              placeholder="Episodes"
              value={episodes}
              onChange={e => setEpisodes(e.target.value)}
              style={{...styles.input, minWidth: '120px'}}
            />
            <button style={styles.button}>Add Anime</button>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Anime</option>
              <option value="planned">📋 Planned</option>
              <option value="watching">👀 Watching</option>
              <option value="done">✅ Completed</option>
            </select>
          </form>
        )}

        {/* Search Form */}
        {mode === 'search' && jikanEnabled && (
          <>
            <form onSubmit={doSearch} style={styles.form}>
              <input
                placeholder="🔍 Search MyAnimeList…"
                value={q}
                onChange={e => setQ(e.target.value)}
                style={styles.input}
              />
              <button style={styles.button}>Search</button>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Anime</option>
                <option value="planned">📋 Planned</option>
                <option value="watching">👀 Watching</option>
                <option value="done">✅ Completed</option>
              </select>
            </form>

            {results.length > 0 && (
              <div style={styles.searchResults}>
                <h3 style={{marginTop: 0, color: '#2c5282'}}>Search Results</h3>
                <div style={{display: 'grid', gap: '15px'}}>
                  {results.map(r => (
                    <div key={r.mal_id} style={{
                      display: 'flex',
                      gap: '15px',
                      alignItems: 'center',
                      padding: '15px',
                      background: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {r.image && (
                        <img 
                          src={r.image} 
                          alt={r.title} 
                          width="60" 
                          height="85" 
                          style={{
                            objectFit: 'cover',
                            borderRadius: '6px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }} 
                        />
                      )}
                      <div style={{flex: 1}}>
                        <div style={{fontWeight: '600', fontSize: '18px', marginBottom: '5px', color: '#2d3748'}}>
                          {r.title}
                        </div>
                        <div style={{color: '#718096', fontSize: '14px'}}>
                          Episodes: {r.episodes ?? '—'} • Score: {r.score ?? '—'} ⭐
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          const exists = list.some(a => a.title.toLowerCase() === r.title.toLowerCase())
                          if (exists) {
                            setMessage(`❌ Entry with title "${r.title}" already exists in your list.`)
                            return
                          }
                          await addAnime({ title: r.title, episodes_total: r.episodes ?? 0 })
                          setResults([])
                          setQ('')
                          setMessage(`✅ Added "${r.title}" from MyAnimeList search.`)
                          refresh()
                        }}
                        style={styles.button}
                      >
                        Add to List
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Anime List */}
        <ul style={styles.animeList}>
          {list.map(a => (
            <li 
              key={a.id} 
              style={styles.animeItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = styles.animeItemHover.transform;
                e.currentTarget.style.boxShadow = styles.animeItemHover.boxShadow;
                e.currentTarget.style.borderColor = styles.animeItemHover.borderColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.borderColor = '#f7fafc';
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                <div>
                  <strong style={{fontSize: '18px', display: 'block', marginBottom: '5px', color: '#2d3748'}}>
                    {a.title}
                  </strong>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: a.status === 'done' ? '#c6f6d5' : 
                               a.status === 'watching' ? '#fed7d7' : 
                               '#bee3f8',
                    color: a.status === 'done' ? '#22543d' : 
                          a.status === 'watching' ? '#742a2a' : 
                          '#2c5282'
                  }}>
                    {a.status.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const ok = confirm(`Remove "${a.title}" from your list?`);
                    if (!ok) return;
                    await deleteAnime(a.id);
                    refresh();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '5px',
                    color: '#e53e3e',
                    transition: 'all 0.2s ease'
                  }}
                  title="Delete"
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.background = '#fed7d7';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = 'none';
                  }}
                >
                  🗑️
                </button>
              </div>

              <div style={{display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <span style={{fontWeight: '500', color: '#4a5568'}}>Progress:</span>
                  {editingId === a.id ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <input
                        type="number"
                        min="0"
                        max={a.episodes_total}
                        value={progressInput}
                        onChange={e => setProgressInput(e.target.value)}
                        onBlur={() => commitEdit(a)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(a) }}
                        style={styles.progressInput}
                        autoFocus
                      />
                      <span style={{color: '#718096'}}>/ {a.episodes_total}</span>
                    </div>
                  ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <b
                        title="Double-click to edit"
                        onDoubleClick={() => startEdit(a)}
                        style={{
                          cursor: 'pointer',
                          padding: '6px 12px',
                          background: '#4299e1',
                          color: 'white',
                          borderRadius: '6px',
                          minWidth: '40px',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#3182ce';
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#4299e1';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        {a.eps_watched}
                      </b>
                      <span style={{color: '#718096'}}>/ {a.episodes_total}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => { updateProgress(a.id, 1).then(refresh) }}
                    style={{
                      ...styles.button,
                      padding: '8px 15px',
                      fontSize: '14px'
                    }}
                  >
                    +1 Episode
                  </button>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{fontWeight: '500', color: '#4a5568'}}>Rating:</span>
                  <div style={{display: 'flex', gap: '5px'}}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <button
                        key={n}
                        onClick={() => handleRatingClick(a, n)}
                        style={{
                          ...styles.ratingButton,
                          ...(a.rating === n && styles.ratingButtonActive)
                        }}
                        onMouseEnter={(e) => {
                          if (a.rating !== n) {
                            e.target.style.background = '#ebf8ff';
                            e.target.style.borderColor = '#90cdf4';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (a.rating !== n) {
                            e.target.style.background = 'white';
                            e.target.style.borderColor = '#e2e8f0';
                          }
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}