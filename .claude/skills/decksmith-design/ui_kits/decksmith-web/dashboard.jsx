/* global React */
// Dashboard screen — recent decks, quick stats, activity feed.
(function () {
  const NS = () => window.DecksmithDesignSystem_0a9b95;
  const { Icons } = window.DSKit;

  function SectionTitle({ children, action }) {
    const { Heading } = NS();
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Heading level={2} size="xl">
          {children}
        </Heading>
        {action}
      </div>
    );
  }

  function StatTile({ label, value, sub, accent }) {
    const { Card, Label } = NS();
    return (
      <Card padding="18px">
        <Label>{label}</Label>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 30,
            marginTop: 8,
            color: accent ? 'var(--accent-text)' : 'var(--text)',
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 4,
            }}
          >
            {sub}
          </div>
        )}
      </Card>
    );
  }

  function Dashboard({ setScreen }) {
    const { Heading, Body, Button, DeckCard } = NS();
    const data = window.DS_DATA;
    const recent = data.decks.slice(0, 3);
    const activityIcon = { plus: Icons.plus, edit: Icons.edit, box: Icons.box, warn: Icons.warn };
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <Heading level={1} size="3xl">
            Welcome back, Jeremie
          </Heading>
          <Body tone="muted" style={{ marginTop: 6 }}>
            Here's where your collection stands today.
          </Body>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <StatTile label="Cards owned" value="2,417" sub="+38 this week" />
          <StatTile label="Decks" value="12" sub="6 Commander" />
          <StatTile label="Collection value" value="$1,284" accent sub="+$64 this week" />
          <StatTile label="Avg coverage" value="82%" sub="across all decks" />
        </div>

        <SectionTitle
          action={
            <Button
              variant="ghost"
              onClick={() => setScreen('decks')}
              iconRight={<Icons.chevron size={16} />}
            >
              All decks
            </Button>
          }
        >
          Recent decks
        </SectionTitle>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {recent.map((d) => (
            <DeckCard key={d.id} onClick={() => setScreen('builder')} {...d} />
          ))}
        </div>

        <SectionTitle>Recent activity</SectionTitle>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-surface)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
          }}
        >
          {data.activity.map((a, i) => {
            const Ico = activityIcon[a.icon] || Icons.plus;
            const tones = {
              success: 'var(--success-text)',
              warning: 'var(--warning-text)',
              default: 'var(--text-muted)',
            };
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderBottom:
                    i < data.activity.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    flex: 'none',
                    borderRadius: 'var(--radius-badge)',
                    background: 'var(--surface-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tones[a.tone] || tones.default,
                  }}
                >
                  <Ico size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)' }}
                  >
                    {a.text}
                  </span>
                  {a.deck && (
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {' '}
                      · {a.deck}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--text-faint)',
                  }}
                >
                  {a.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  window.DSKit = Object.assign(window.DSKit || {}, { Dashboard });
})();
