import { Icon, Section } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import './practice.css';

interface Resource {
  label: string;
  description: string;
  url: string;
}

const GROUPS: { title: string; items: Resource[] }[] = [
  {
    title: 'Java',
    items: [
      { label: 'Documentation Java (Oracle)', description: 'API officielle du JDK', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/' },
      { label: 'Spring Framework', description: 'Référence Spring et Spring Boot', url: 'https://docs.spring.io/spring-boot/index.html' },
      { label: 'Baeldung', description: 'Tutoriels Java et Spring', url: 'https://www.baeldung.com/' },
    ],
  },
  {
    title: 'Web et langages',
    items: [
      { label: 'MDN Web Docs', description: 'JavaScript, HTML, CSS et API navigateur', url: 'https://developer.mozilla.org/fr/' },
      { label: 'Python Docs', description: 'Documentation officielle Python', url: 'https://docs.python.org/3/' },
      { label: 'PostgreSQL', description: 'Référence SQL', url: 'https://www.postgresql.org/docs/current/' },
    ],
  },
  {
    title: 'Communaute',
    items: [
      { label: 'Stack Overflow', description: 'Questions et réponses', url: 'https://stackoverflow.com/' },
      { label: 'Docker Docs', description: 'Conteneurs et images', url: 'https://docs.docker.com/' },
    ],
  },
];

/**
 * A PWA has no free-form WebView: nearly every documentation site sends
 * X-Frame-Options or a frame-ancestors CSP that forbids embedding, and working
 * around that would mean defeating a security header. So each resource opens in
 * a new Safari tab instead, which is also the only way links stay usable.
 */
export function ResourcesScreen() {
  return (
    <main className="ap-page">
      <TopBar title="Ressources" />
      <p className="ap-body" style={{ marginBottom: 18 }}>
        Les sites de documentation interdisent leur affichage dans un cadre intégré. Chaque lien s’ouvre donc dans un
        nouvel onglet du navigateur.
      </p>
      <div className="ap-stack">
        {GROUPS.map((group) => (
          <Section key={group.title} title={group.title} icon="globe">
            <div className="ap-list">
              {group.items.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ap-list-card resource-row"
                >
                  <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-blue">
                    <Icon name="globe" size={17} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 650, color: 'var(--ap-text)' }}>{item.label}</span>
                    <span className="ap-caption">{item.description}</span>
                  </span>
                  <Icon name="external" size={17} style={{ color: 'var(--ap-text-faint)' }} />
                </a>
              ))}
            </div>
          </Section>
        ))}
      </div>
    </main>
  );
}
