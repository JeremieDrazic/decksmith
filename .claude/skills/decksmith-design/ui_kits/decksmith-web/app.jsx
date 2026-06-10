/* global React, ReactDOM */
// Decksmith web — interactive kit entry. Login → app shell with routed screens.
(function () {
  const {
    Sidebar,
    TopBar,
    GlobalSearch,
    Login,
    Dashboard,
    DeckList,
    DeckBuilder,
    Collection,
    CardSearch,
  } = window.DSKit;

  function App() {
    const [authed, setAuthed] = React.useState(false);
    const [screen, setScreen] = React.useState('dashboard');
    const [expanded, setExpanded] = React.useState(false);
    const [search, setSearch] = React.useState(false);
    const [theme, setTheme] = React.useState('dark');

    React.useEffect(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    React.useEffect(() => {
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setSearch(true);
        }
        if (e.key === 'Escape') setSearch(false);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);

    const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

    if (!authed)
      return <Login onLogin={() => setAuthed(true)} theme={theme} onToggleTheme={toggleTheme} />;

    const screens = {
      dashboard: <Dashboard setScreen={setScreen} />,
      decks: <DeckList setScreen={setScreen} />,
      builder: <DeckBuilder setScreen={setScreen} />,
      collection: <Collection />,
      search: <CardSearch />,
      settings: <Settings />,
    };
    const navScreen = screen === 'builder' ? 'decks' : screen;

    return (
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        <Sidebar
          screen={navScreen}
          setScreen={setScreen}
          expanded={expanded}
          onToggle={() => setExpanded((e) => !e)}
        />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <TopBar onSearch={() => setSearch(true)} theme={theme} onToggleTheme={toggleTheme} />
          <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>{screens[screen]}</main>
        </div>
        {search && <GlobalSearch onClose={() => setSearch(false)} />}
      </div>
    );
  }

  function Settings() {
    const NS = window.DecksmithDesignSystem_0a9b95;
    const { Heading, Body, Switch, Card } = NS;
    const [a, setA] = React.useState(true);
    const [b, setB] = React.useState(false);
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Heading level={1} size="3xl" style={{ marginBottom: 20 }}>
          Settings
        </Heading>
        <Card style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Row
            title="Print crop marks"
            desc="Add crop marks to generated proxy sheets."
            control={<Switch checked={a} onChange={setA} />}
          />
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <Row
            title="Public deck sharing"
            desc="Allow others to view your decks by link."
            control={<Switch checked={b} onChange={setB} />}
          />
        </Card>
      </div>
    );
    function Row({ title, desc, control }) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>
              {title}
            </div>
            <Body size="sm" tone="muted" style={{ marginTop: 2 }}>
              {desc}
            </Body>
          </div>
          {control}
        </div>
      );
    }
  }

  ReactDOM.createRoot(document.getElementById('app')).render(<App />);
})();
