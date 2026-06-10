/* global React */
// App shell: Sidebar, TopBar (+ global-search spotlight), Login.
(function () {
  const { Icons, Logo } = window.DSKit;
  const NS = () => window.DecksmithDesignSystem_0a9b95;

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'decks', label: 'Decks', icon: 'decks' },
    { id: 'collection', label: 'Collection', icon: 'collection' },
    { id: 'search', label: 'Card Search', icon: 'search' },
  ];

  function Sidebar({ screen, setScreen, expanded, onToggle }) {
    const w = expanded ? 216 : 72;
    const Item = ({ id, label, icon }) => {
      const active = screen === id;
      const Ico = Icons[icon];
      return (
        <button
          onClick={() => setScreen(id)}
          title={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            height: 44,
            padding: expanded ? '0 14px' : 0,
            justifyContent: expanded ? 'flex-start' : 'center',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 'var(--radius-interactive)',
            background: active ? 'var(--accent-subtle)' : 'transparent',
            color: active ? 'var(--accent-text)' : 'var(--text-muted)',
            transition:
              'background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (!active) e.currentTarget.style.background = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            if (!active) e.currentTarget.style.background = 'transparent';
          }}
        >
          {active && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 10,
                bottom: 10,
                width: 3,
                borderRadius: 2,
                background: 'var(--accent)',
              }}
            />
          )}
          <Ico size={20} />
          {expanded && (
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14 }}>
              {label}
            </span>
          )}
        </button>
      );
    };
    return (
      <aside
        style={{
          width: w,
          flex: 'none',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          gap: 4,
          transition: 'width var(--duration-page) var(--ease-in-out)',
        }}
      >
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            paddingLeft: expanded ? 6 : 0,
            marginBottom: 8,
          }}
        >
          <Logo withWord={expanded} />
        </div>
        {NAV.map((n) => (
          <Item key={n.id} {...n} />
        ))}
        <div style={{ flex: 1 }} />
        <Item id="settings" label="Settings" icon="settings" />
        <button
          onClick={onToggle}
          title={expanded ? 'Collapse' : 'Expand'}
          style={{
            height: 40,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-faint)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-interactive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              display: 'inline-flex',
              transition: 'transform var(--duration-page) var(--ease-in-out)',
            }}
          >
            <Icons.chevron size={18} />
          </span>
          {expanded && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Collapse</span>
          )}
        </button>
      </aside>
    );
  }

  function GlobalSearch({ onClose }) {
    const { Label } = NS();
    const groups = window.DS_DATA.searchGroups;
    return (
      <div
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 'var(--z-overlay)',
          background: 'rgba(8,7,14,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 90,
        }}
      >
        <div
          style={{
            width: 560,
            maxWidth: '92%',
            height: 'fit-content',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-modal)',
            boxShadow: 'var(--shadow-overlay)',
            overflow: 'hidden',
            animation: 'kPop var(--duration-slow) var(--ease-spring)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 16px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              <Icons.search size={18} />
            </span>
            <input
              autoFocus
              placeholder="Search cards, decks, collection…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: 15,
              }}
            />
            <kbd
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-faint)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '2px 6px',
              }}
            >
              ESC
            </kbd>
          </div>
          <div style={{ padding: 8, maxHeight: 360, overflow: 'auto' }}>
            {groups.map((g) => (
              <div key={g.group} style={{ marginBottom: 6 }}>
                <div style={{ padding: '8px 10px 4px' }}>
                  <Label>{g.group}</Label>
                </div>
                {g.items.map((it) => (
                  <div
                    key={it}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
                      borderRadius: 'var(--radius-interactive)',
                      cursor: 'pointer',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 14,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--surface-hover)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: 'var(--text-faint)' }}>
                      {g.group === 'Cards' ? (
                        <Icons.search size={15} />
                      ) : g.group === 'Decks' ? (
                        <Icons.decks size={15} />
                      ) : (
                        <Icons.collection size={15} />
                      )}
                    </span>
                    {it}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes kPop{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}`}</style>
      </div>
    );
  }

  function TopBar({ onSearch, theme, onToggleTheme }) {
    const { Avatar } = NS();
    return (
      <header
        style={{
          height: 60,
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg)',
        }}
      >
        <button
          onClick={onSearch}
          style={{
            flex: 1,
            maxWidth: 460,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 12px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-interactive)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
          }}
        >
          <Icons.search size={16} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search cards, decks, collection…</span>
          <kbd
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-faint)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '1px 5px',
            }}
          >
            ⌘K
          </kbd>
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          style={{
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-interactive)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          {theme === 'dark' ? '☾' : '☀'}
        </button>
        <button
          title="Notifications"
          style={{
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-interactive)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <Icons.bell size={18} />
        </button>
        <Avatar name={window.DS_DATA.user.name} />
      </header>
    );
  }

  function Login({ onLogin, theme, onToggleTheme }) {
    const { Button, Input } = NS();
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--bg)',
        }}
      >
        <button
          onClick={onToggleTheme}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 38,
            height: 38,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-interactive)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          {theme === 'dark' ? '☾' : '☀'}
        </button>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              marginBottom: 26,
            }}
          >
            <Logo size={44} withWord={false} />
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: '-0.015em',
              }}
            >
              Decksmith
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Build decks deliberately.
            </div>
          </div>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-modal)',
              boxShadow: 'var(--shadow-card)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <Input
              label="Email"
              placeholder="you@example.com"
              defaultValue="jeremie@decksmith.app"
            />
            <Input label="Password" type="password" defaultValue="password" />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a
                href="#"
                style={{
                  fontSize: 13,
                  color: 'var(--accent-text)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Forgot password?
              </a>
            </div>
            <Button fullWidth size="lg" onClick={onLogin}>
              Log in
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              justifyContent: 'center',
              marginTop: 18,
              color: 'var(--brand)',
            }}
          >
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />◈
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div
            style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}
          >
            New here?{' '}
            <a
              href="#"
              onClick={onLogin}
              style={{ color: 'var(--accent-text)', textDecoration: 'none', fontWeight: 600 }}
            >
              Create an account
            </a>
          </div>
        </div>
      </div>
    );
  }

  window.DSKit = Object.assign(window.DSKit || {}, { Sidebar, TopBar, GlobalSearch, Login });
})();
