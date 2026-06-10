/* global React */
// Decks screens: DeckList (grid/list + filters) and DeckBuilder (sections,
// card-add slide-over, stats panel).
(function () {
  const NS = () => window.DecksmithDesignSystem_0a9b95;
  const { Icons } = window.DSKit;

  function Separator() {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          color: 'var(--brand)',
          margin: '18px 0',
        }}
      >
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(90deg,transparent,var(--border),transparent)',
          }}
        />
        ◈
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(90deg,transparent,var(--border),transparent)',
          }}
        />
      </div>
    );
  }

  function Toolbar({ view, setView }) {
    const { Input, Select } = NS();
    const Toggle = ({ id, icon: Ico }) => (
      <button
        onClick={() => setView(id)}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          background: view === id ? 'var(--accent-subtle)' : 'var(--surface)',
          color: view === id ? 'var(--accent-text)' : 'var(--text-muted)',
          cursor: 'pointer',
          borderRadius: 'var(--radius-interactive)',
        }}
      >
        <Ico size={17} />
      </button>
    );
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <Input
          placeholder="Filter my decks…"
          iconLeft={<Icons.search size={15} />}
          containerStyle={{ width: 220 }}
        />
        <Select
          options={['All formats', 'Commander', 'Modern', 'Standard']}
          containerStyle={{ width: 150 }}
        />
        <Select
          options={['All colors', 'White', 'Blue', 'Black', 'Red', 'Green']}
          containerStyle={{ width: 140 }}
        />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <Toggle id="grid" icon={Icons.grid} />
          <Toggle id="list" icon={Icons.list} />
        </div>
      </div>
    );
  }

  function ListRow({ d, onOpen }) {
    const { ColorIdentity, FormatBadge, CoverageStamp } = NS();
    return (
      <div
        onClick={onOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <div
          style={{
            width: 44,
            height: 44,
            flex: 'none',
            borderRadius: 'var(--radius-interactive)',
            background: 'var(--surface-raised)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(135deg, var(--mtg-${d.colors[0] === 'w' ? 'white' : d.colors[0] === 'u' ? 'blue' : d.colors[0] === 'b' ? 'black' : d.colors[0] === 'r' ? 'red' : 'green'}), var(--surface))`,
            }}
          />
        </div>
        <div
          style={{
            width: 200,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          {d.name}
        </div>
        <FormatBadge format={d.format} />
        <ColorIdentity colors={d.colors} />
        <div style={{ flex: 1 }} />
        <CoverageStamp percent={d.coverage} />
        <div
          style={{
            width: 64,
            textAlign: 'right',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--brand)',
          }}
        >
          {d.price}
        </div>
        <Icons.more size={16} style={{ color: 'var(--text-faint)' }} />
      </div>
    );
  }

  function DeckList({ setScreen }) {
    const { Heading, Button, DeckCard } = NS();
    const [view, setView] = React.useState('grid');
    const decks = window.DS_DATA.decks;
    return (
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <Heading level={1} size="3xl">
            My decks
          </Heading>
          <Button iconLeft={<Icons.plus size={16} />} onClick={() => setScreen('builder')}>
            New deck
          </Button>
        </div>
        <Toolbar view={view} setView={setView} />
        <Separator />
        {view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {decks.map((d) => (
              <DeckCard key={d.id} onClick={() => setScreen('builder')} {...d} />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-surface)',
              overflow: 'hidden',
            }}
          >
            {decks.map((d) => (
              <ListRow key={d.id} d={d} onOpen={() => setScreen('builder')} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Deck Builder ─────────────────────────────────────────────────────────
  function AddPanel({ open, onClose }) {
    const { Input, CardThumb } = NS();
    const cards = window.DS_DATA.cards.slice(0, 8);
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: open ? 340 : 0,
          background: 'var(--surface)',
          borderLeft: open ? '1px solid var(--border)' : 'none',
          boxShadow: open ? 'var(--shadow-overlay)' : 'none',
          transition: 'width var(--duration-slow) var(--ease-spring)',
          overflow: 'hidden',
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: 340,
            padding: 16,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
              Add cards
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <Icons.x size={18} />
            </button>
          </div>
          <Input
            placeholder="Search Scryfall…"
            iconLeft={<Icons.search size={15} />}
            containerStyle={{ marginBottom: 14 }}
          />
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, overflow: 'auto' }}
          >
            {cards.map((c) => (
              <CardThumb
                key={c.name}
                width={145}
                name={c.name}
                cost={c.cost}
                colors={c.colors}
                rarity={c.rarity}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  function DeckBuilder({ setScreen }) {
    const { Heading, Button, FormatBadge, ColorIdentity, CoverageStamp, ManaCurve, StatRow } = NS();
    const [add, setAdd] = React.useState(false);
    const b = window.DS_DATA.builder;
    const mtgVar = (c) =>
      `var(--mtg-${c === 'w' ? 'white' : c === 'u' ? 'blue' : c === 'b' ? 'black' : c === 'r' ? 'red' : 'green'})`;
    return (
      <div
        style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <button
            onClick={() => setScreen('decks')}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-interactive)',
              width: 36,
              height: 36,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'scaleX(-1)',
            }}
          >
            <Icons.chevron size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <Heading level={1} size="2xl">
              {b.deck.name}
            </Heading>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <FormatBadge format={b.deck.format} tone="accent" />
              <ColorIdentity colors={b.deck.colors} />
              <CoverageStamp percent={b.deck.coverage} />
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}
              >
                {b.deck.count} cards
              </span>
            </div>
          </div>
          <Button iconLeft={<Icons.plus size={16} />} onClick={() => setAdd(true)}>
            Add cards
          </Button>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: 18, minHeight: 0 }}>
          {/* sections list */}
          <div style={{ flex: 1, overflow: 'auto', paddingRight: 4 }}>
            {b.sections.map((s) => (
              <div key={s.name} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {s.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-faint)',
                    }}
                  >
                    {s.cards.reduce((a, c) => a + c.qty, 0)}
                  </span>
                  <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                </div>
                {s.cards.map((c) => (
                  <CardRow key={c.name} c={c} />
                ))}
              </div>
            ))}
          </div>

          {/* stats panel */}
          <div
            style={{ width: 280, flex: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-surface)',
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                }}
              >
                Mana curve
              </div>
              <ManaCurve data={b.curve} height={100} />
            </div>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-surface)',
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                }}
              >
                Color distribution
              </div>
              {b.distribution.map((d) => (
                <div
                  key={d.color}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}
                >
                  <span
                    style={{
                      width: 26,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {d.color}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      background: 'var(--surface-raised)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${d.count * 4}%`,
                        height: '100%',
                        background: mtgVar(d.color),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--text-faint)',
                    }}
                  >
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-surface)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
              }}
            >
              <StatRow label="Coverage" value="87%" accent />
              <StatRow label="Avg CMC" value="3.2" />
              <StatRow label="Value" value="$142.00" />
            </div>
          </div>
        </div>
        <AddPanel open={add} onClose={() => setAdd(false)} />
      </div>
    );
  }

  function CardRow({ c }) {
    const { ManaCost } = NS();
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '7px 10px',
          borderRadius: 'var(--radius-interactive)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span
          style={{
            width: 22,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          {c.qty}×
        </span>
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: c.owned ? 'var(--text)' : 'var(--text-muted)',
          }}
        >
          {c.name}
        </span>
        {!c.owned && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--warning-text)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-sm)',
              padding: '1px 5px',
            }}
          >
            need
          </span>
        )}
        <ManaCost cost={c.cost} size="sm" />
      </div>
    );
  }

  window.DSKit = Object.assign(window.DSKit || {}, { DeckList, DeckBuilder });
})();
