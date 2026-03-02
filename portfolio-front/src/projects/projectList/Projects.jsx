import "./Project.css";

const projects = [
  {
    title: "AutoInvest",
    period: "2개월",
    tags: ["WebSocket", "Spring WebFlux", "Redis", "AWS"],
    desc:
        "실시간 시세 스트림을 처리하고 다수 동시 접속 상황에서 안정적으로 브로드캐스트하는 구조를 설계했습니다.",
    links: [
      { label: "GitHub", href: "#" },
      { label: "Demo", href: "#" },
    ],
  }
];

export default function Projects() {
  return (
      <section id="projects" className="section">
        <div className="sectionHead">
        </div>

        <div className="cardGrid">
          {projects.map((p) => (
              <article key={p.title} className="card">
                <div className="cardTop">
                  <h3 className="h3">{p.title}</h3>
                  <span className="muted">{p.period}</span>
                </div>

                <p className="cardDesc">{p.desc}</p>

                <div className="tagRow">
                  {p.tags.map((t) => (
                      <span key={t} className="tag">
                  {t}
                </span>
                  ))}
                </div>

                <div className="linkRow">
                  {p.links.map((l) => (
                      <a
                          key={l.label}
                          className="textLink"
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                      >
                        {l.label} →
                      </a>
                  ))}
                </div>
              </article>
          ))}
        </div>
      </section>
  );
}