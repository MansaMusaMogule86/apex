const LOGOS = ["EMAAR","Burj Al Arab","DIOR","One&Only","Porsche","Four Seasons","Louis Vuitton","DAMAC","Aman","Bentley"];

export default function LogoMarquee() {
  return (
    <div id="logos" className="logos-band">
      <div className="logo-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="logo-item" aria-hidden={dup === 1}>
            {LOGOS.map((name, i) => (
              <span key={i} style={{ display: "contents" }}>
                {name}
                <span className="logo-sep" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
