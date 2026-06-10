/* global React */
// Collection (table/grid + filter sidebar) and Card Search (WUBRG filters + grid).
(function () {
  const NS = () => window.DecksmithDesignSystem_0a9b95;
  const { Icons } = window.DSKit;

  function FilterGroup({ title, children }) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 10,
          }}
        >
          {title}
        </div>
        {children}
      </div>
    );
  }

  function ColorToggles({ value, onChange }) {
    const { Mana } = NS();
    const all = ['w', 'u', 'b', 'r', 'g', 'c'];
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {all.map((c) => {
          const on = value.includes(c);
          return (
            <button
              key={c}
              onClick={() => onChange(on ? value.filter((x) => x !== c) : [...value, c])}
              style={{
                padding: 3,
                borderRadius: 'var(--radius-badge)',
                border: `2px solid ${on ? 'var(--accent)' : 'transparent'}`,
                background: 'transparent',
                cursor: 'pointer',
                opacity: on ? 1 : 0.5,
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
            >
              <Mana symbol={c} size="md" />
            </button>
          );
        })}
      </div>
    );
  }

  function CheckRow({ label, dot, checked, onToggle }) {
    const { Checkbox } = NS();
    return (
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '5px 0',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
      >
        <Checkbox checked={checked} onChange={onToggle} />
        {dot && (
          <span
            style={{ width: 10, height: 10, borderRadius: 'var(--radius-badge)', background: dot }}
          />
        )}
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text)' }}>
          {label}
        </span>
      </label>
    );
  }

  function Collection() {
    const { Heading, Input, Badge, RarityDot, ManaCost } = NS();
    const [view, setView] = React.useState('table');
    const [rar, setRar] = React.useState(['rare', 'mythic']);
    const cards = window.DS_DATA.cards;
    const tr = (r) => setRar(rar.includes(r) ? rar.filter((x) => x !== r) : [...rar, r]);
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
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <Heading level={1} size="3xl" style={{ marginBottom: 20 }}>
          Collection
        </Heading>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          {/* filter sidebar */}
          <aside
            style={{
              width: 220,
              flex: 'none',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-surface)',
              padding: 18,
            }}
          >
            <FilterGroup title="Color">
              <ColorToggles value={['u', 'b']} onChange={() => {}} />
            </FilterGroup>
            <FilterGroup title="Rarity">
              <CheckRow
                label="Common"
                dot="#9aa3ab"
                checked={rar.includes('common')}
                onToggle={() => tr('common')}
              />
              <CheckRow
                label="Uncommon"
                dot="#c8cdd4"
                checked={rar.includes('uncommon')}
                onToggle={() => tr('uncommon')}
              />
              <CheckRow
                label="Rare"
                dot="var(--brand)"
                checked={rar.includes('rare')}
                onToggle={() => tr('rare')}
              />
              <CheckRow
                label="Mythic"
                dot="#e0701f"
                checked={rar.includes('mythic')}
                onToggle={() => tr('mythic')}
              />
            </FilterGroup>
            <FilterGroup title="Format">
              <CheckRow label="Commander" checked onToggle={() => {}} />
              <CheckRow label="Modern" checked={false} onToggle={() => {}} />
            </FilterGroup>
          </aside>

          {/* main */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Input
                placeholder="Search your collection…"
                iconLeft={<Icons.search size={15} />}
                containerStyle={{ flex: 1 }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <Toggle id="table" icon={Icons.list} />
                <Toggle id="grid" icon={Icons.grid} />
              </div>
            </div>
            {view === 'table' ? (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-surface)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 0.6fr 0.6fr 0.5fr 0.6fr',
                    gap: 12,
                    padding: '11px 16px',
                    borderBottom: '1px solid var(--border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>Card</span>
                  <span>Set</span>
                  <span>Cond.</span>
                  <span>Qty</span>
                  <span style={{ textAlign: 'right' }}>Price</span>
                </div>
                {cards.map((c, i) => (
                  <div
                    key={c.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.6fr 0.6fr 0.6fr 0.5fr 0.6fr',
                      gap: 12,
                      alignItems: 'center',
                      padding: '11px 16px',
                      borderBottom:
                        i < cards.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--surface-hover)')
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                      <RarityDot rarity={c.rarity} />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 14,
                          color: 'var(--text)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.name}
                      </span>
                      <ManaCost cost={c.cost} size="sm" />
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {c.set}
                    </span>
                    <span>
                      <Badge>{c.condition}</Badge>
                    </span>
                    <span
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)' }}
                    >
                      {c.qty}×
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        color: 'var(--brand)',
                        textAlign: 'right',
                      }}
                    >
                      €{c.price}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <CardGrid cards={cards} />
            )}
          </div>
        </div>
      </div>
    );
  }

  function CardGrid({ cards }) {
    const { CardThumb } = NS();
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 14,
        }}
      >
        {cards.map((c) => (
          <CardThumb
            key={c.name}
            name={c.name}
            cost={c.cost}
            colors={c.colors}
            rarity={c.rarity}
            owned={c.qty}
          />
        ))}
      </div>
    );
  }

  function CardSearch() {
    const { Heading, Body, Input, Button, Select } = NS();
    const [colors, setColors] = React.useState(['u', 'b']);
    const [cmc, setCmc] = React.useState(7);
    const cards = window.DS_DATA.cards;
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Heading level={1} size="3xl" style={{ marginBottom: 4 }}>
          Card search
        </Heading>
        <Body tone="muted" style={{ marginBottom: 20 }}>
          Search every card on Scryfall and add straight to a deck.
        </Body>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          <aside
            style={{
              width: 250,
              flex: 'none',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-surface)',
              padding: 18,
            }}
          >
            <FilterGroup title="Color identity">
              <ColorToggles value={colors} onChange={setColors} />
            </FilterGroup>
            <FilterGroup title={`Mana value ≤ ${cmc}`}>
              <input
                type="range"
                min="0"
                max="12"
                value={cmc}
                onChange={(e) => setCmc(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent)' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-faint)',
                  marginTop: 2,
                }}
              >
                <span>0</span>
                <span>12+</span>
              </div>
            </FilterGroup>
            <FilterGroup title="Rarity">
              <CheckRow label="Rare" dot="var(--brand)" checked onToggle={() => {}} />
              <CheckRow label="Mythic" dot="#e0701f" checked onToggle={() => {}} />
            </FilterGroup>
            <FilterGroup title="Type">
              <Select
                options={['Any type', 'Creature', 'Instant', 'Sorcery', 'Artifact', 'Land']}
              />
            </FilterGroup>
            <Button fullWidth variant="secondary">
              Reset filters
            </Button>
          </aside>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Input
              placeholder="Search by name, text, type…"
              iconLeft={<Icons.search size={15} />}
              containerStyle={{ marginBottom: 16 }}
            />
            <CardGrid cards={cards} />
          </div>
        </div>
      </div>
    );
  }

  window.DSKit = Object.assign(window.DSKit || {}, { Collection, CardSearch });
})();
